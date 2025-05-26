import { signWsTypedData } from '../ws-utils';
import { InvalidParameterError } from '../error';
import { WalletClient } from 'viem';
import { UserWsClient } from './user-ws-client';

import { CHAINS, OrderDirection, OrderType, ENVIRONMENT, PLATFORMS, CreateOrder } from '../types';

import {
   LoginPayloadRequest,
   MmWsCancelOrderRequestData,
   MmWsJitAnswerRequestData,
   MmWsLimitOrderRequestData,
   MmPureOperationResponse,
   MmSubscriptionPush,
   PostPayloadRequest,
   MmWsCreateOrdersRequestData,
   MmWsCancelOrdersRequestData,
   UserWsRequest,
   MmSpecificChannels,
   MM_WS_CLIENT_CHANNELS,
} from './types';

import { MM_WS_LOGIN_RESPONSE_RESULT, MM_WS_POST_RESPONSE_RESULT } from './constants';

// Changed MmWsHandlerCallback to accept a generic payload
// Specific handlers will need to cast/know what payload to expect based on the event they handle.
type MmWsHandlerCallback = (payload: any) => void;

// Define a union of MM-specific channel/result keys for handler typing
type MmClientHandlerKeys =
   | MmSpecificChannels
   | typeof MM_WS_LOGIN_RESPONSE_RESULT
   | typeof MM_WS_POST_RESPONSE_RESULT;

// Helper constants for type guards, defined at module level for clarity and efficiency
const mmSpecificChannelValues = Object.values(MM_WS_CLIENT_CHANNELS);

export class MmWsClient extends UserWsClient {
   protected _chainId: CHAINS;
   protected _platform: PLATFORMS;
   protected _walletClient: WalletClient;
   protected _environment: ENVIRONMENT;

   protected _mmHandlers: Partial<Record<MmClientHandlerKeys, MmWsHandlerCallback[]>> = {};

   constructor(
      chainId: CHAINS,
      platform: PLATFORMS,
      walletClient: WalletClient,
      environment: ENVIRONMENT,
      wsUrl: string,
   ) {
      super(wsUrl);
      this._chainId = chainId;
      this._platform = platform;
      this._walletClient = walletClient;
      this._environment = environment;
      this._wsUrl = wsUrl;

      const initialMmHandlers: Record<MmClientHandlerKeys, MmWsHandlerCallback[]> = {} as Record<
         MmClientHandlerKeys,
         MmWsHandlerCallback[]
      >;
      for (const channel of mmSpecificChannelValues) {
         initialMmHandlers[channel as MmSpecificChannels] = [];
      }
      initialMmHandlers[MM_WS_LOGIN_RESPONSE_RESULT] = [];
      initialMmHandlers[MM_WS_POST_RESPONSE_RESULT] = [];
      this._mmHandlers = initialMmHandlers;
   }

   get chainId(): CHAINS {
      return this._chainId;
   }
   get platform(): PLATFORMS {
      return this._platform;
   }
   get walletClient(): WalletClient {
      return this._walletClient;
   }

   protected override async onOpen(): Promise<void> {
      try {
         await this.login();
      } catch (error) {
         const err =
            error instanceof Error ? error : new Error('MM WebSocket login failed during onOpen');
         console.error(err.message, error);
         this.onError(err);
         this.disconnect();
      }
   }

   private async login(): Promise<void> {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signWsTypedData(
         this._platform,
         this._chainId,
         this._walletClient,
         timestamp,
         this._environment,
      );
      const loginRequest: LoginPayloadRequest = {
         id: `login-${Date.now()}`,
         method: 'login',
         authentication: {
            platform: this._platform,
            chain_id: this._chainId,
            timestamp: timestamp,
            signature: signature,
         },
      };
      super.send(loginRequest as unknown as UserWsRequest);
   }

   protected override handleMessage(message: any): void {
      if (this.isMmOperationResponse(message)) {
         return this.handleMmOperationResponse(message);
      }
      if (this.isMmSubscriptionPush(message)) {
         return this.handleMmSubscriptionPush(message);
      }
      // If not an MM-specific message, delegate to UserWsClient.
      super.handleMessage(message);
   }

   protected handleMmOperationResponse(message: MmPureOperationResponse): void {
      if (!this._mmHandlers.hasOwnProperty(message.result)) {
         return;
      }

      const callbacks = this._mmHandlers[message.result];
      if (callbacks && callbacks.length > 0) {
         const dataForCallback = message.success ? message.data : message.error;
         for (const callback of callbacks) {
            try {
               callback(dataForCallback);
            } catch (e) {
               console.error('Error in MmWs MM Operation handler:', e);
            }
         }
      }
   }
   protected handleMmSubscriptionPush(message: MmSubscriptionPush): void {
      const channelKey = message.channel;
      if (!this._mmHandlers.hasOwnProperty(channelKey)) {
         return;
      }

      // Cast channelKey to MmSpecificChannels after hasOwnProperty check for type safety
      const callbacks = this._mmHandlers[channelKey as MmSpecificChannels];
      if (callbacks && callbacks.length > 0) {
         for (const callback of callbacks) {
            try {
               callback(message.data);
            } catch (e) {
               console.error('Error in MmWs MM Subscription handler:', e);
            }
         }
      }
   }

   // Type guard for MM Operation Responses
   private isMmOperationResponse(m: any): m is MmPureOperationResponse {
      if (!m || typeof m !== 'object') return false;
      // Check if 'result' exists and is one of the MM-specific operation results
      return (
         typeof m.result === 'string' &&
         (m.result === MM_WS_LOGIN_RESPONSE_RESULT || m.result === MM_WS_POST_RESPONSE_RESULT)
      );
   }

   // Type guard for MM Subscription Pushes
   private isMmSubscriptionPush(m: any): m is MmSubscriptionPush {
      if (
         !(
            m &&
            typeof m === 'object' &&
            typeof m.channel === 'string' &&
            m.result === undefined &&
            'data' in m
         )
      ) {
         return false;
      }
      // Removed the explicit check against mmSpecificChannelValues
      // Any message structurally resembling an MM subscription push will pass.
      return true;
   }

   addMmHandler(handlerFor: MmClientHandlerKeys, callback: MmWsHandlerCallback): void {
      if (!this._mmHandlers[handlerFor]) {
         this._mmHandlers[handlerFor] = [];
      }
      this._mmHandlers[handlerFor]!.push(callback);
   }

   removeMmHandler(handlerFor: MmClientHandlerKeys, callbackToRemove: MmWsHandlerCallback): void {
      const callbacks = this._mmHandlers[handlerFor];
      if (callbacks) {
         this._mmHandlers[handlerFor] = callbacks.filter((cb) => cb !== callbackToRemove);
      }
   }

   private post(
      channel: PostPayloadRequest['request']['channel'],
      data: PostPayloadRequest['request']['data'],
      requestId?: string,
   ): void {
      const postRequest: PostPayloadRequest = {
         id: requestId ?? `post-${Date.now()}`,
         method: 'post',
         request: {
            channel,
            data,
         },
      };
      super.send(postRequest as unknown as UserWsRequest);
   }

   limitOrder(
      symbol: string,
      direction: OrderDirection,
      price: string,
      quantity: string,
      leverage: number,
      expiryTime: number,
      clientOrderId?: string,
      requestId?: string,
   ): void {
      const limitOrderData: MmWsLimitOrderRequestData = {
         symbol,
         direction,
         type: OrderType.LIMIT,
         price,
         quantity,
         slippage: '0',
         leverage,
         expiry_time: expiryTime,
         ...(clientOrderId && { client_order_id: clientOrderId }),
      };
      this.post(MM_WS_CLIENT_CHANNELS.LIMIT_ORDER, limitOrderData, requestId);
   }

   answerJit(
      symbol: string,
      direction: OrderDirection,
      expiryTimeMs: number,
      price: string,
      quantity: string,
      userOrderHash: string,
      clientOrderId?: string,
      requestId?: string,
   ): void {
      const answerJitData: MmWsJitAnswerRequestData = {
         symbol,
         direction,
         expiry_time_ms: expiryTimeMs,
         price,
         quantity,
         user_order_hash: userOrderHash,
         ...(clientOrderId && { client_order_id: clientOrderId }),
      };
      this.post(MM_WS_CLIENT_CHANNELS.ANSWER_JIT, answerJitData, requestId);
   }

   cancelOrder(orderNo?: string, clientOrderId?: string, requestId?: string): void {
      if (!orderNo && !clientOrderId) {
         throw new InvalidParameterError(
            'orderNo or clientOrderId',
            'Either orderNo or clientOrderId must be present',
         );
      }
      const cancelOrderData: MmWsCancelOrderRequestData = {
         ...(orderNo && { order_no: orderNo }),
         ...(clientOrderId && { client_order_id: clientOrderId }),
      };
      this.post(MM_WS_CLIENT_CHANNELS.CANCEL_ORDER, cancelOrderData, requestId);
   }

   createOrders(orders: CreateOrder[], requestId?: string): void {
      const createOrdersData: MmWsCreateOrdersRequestData = orders;
      this.post(MM_WS_CLIENT_CHANNELS.CREATE_ORDERS, createOrdersData, requestId);
   }

   cancelOrders(orderNos?: string[], clientOrderIds?: string[], requestId?: string): void {
      if (
         (!orderNos || orderNos.length === 0) &&
         (!clientOrderIds || clientOrderIds.length === 0)
      ) {
         throw new InvalidParameterError('orderNos or clientOrderIds', 'Must be non-empty');
      }
      const cancelOrdersData: MmWsCancelOrdersRequestData = {};
      if (orderNos && orderNos.length > 0) cancelOrdersData.order_no = orderNos;
      if (clientOrderIds && clientOrderIds.length > 0)
         cancelOrdersData.client_order_id = clientOrderIds;
      this.post(MM_WS_CLIENT_CHANNELS.CANCEL_ORDERS, cancelOrdersData, requestId);
   }
}
