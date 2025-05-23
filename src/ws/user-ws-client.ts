import { USER_WS_RESPONSE_RESULT } from "./constants"
import { BaseWsClient } from "./base-ws-client"
import {
   USER_WS_CLIENT_ADDRESS_CHANNELS,
   USER_WS_CLIENT_SYMBOL_CHANNELS,
   PUBLIC_WS_REQUEST_TYPES,
   UserWsRequest,
   UserWsResponse,
   UserPureOperationResponse,
   UserSubscriptionPush,
} from "./types"

type WsHandlerCallback = (payload: any) => void;

export class UserWsClient extends BaseWsClient<
   USER_WS_CLIENT_SYMBOL_CHANNELS | USER_WS_CLIENT_ADDRESS_CHANNELS | typeof USER_WS_RESPONSE_RESULT,
   UserWsRequest,
   UserWsResponse,
   WsHandlerCallback
> {
   private userAccountAddress: string | undefined;

   constructor(wsUrl: string) {
      super(wsUrl);
      // Initialize specific handlers for UserWsClient
      this._handlers = {
         [USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET]: [],
         [USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK]: [],
         [USER_WS_CLIENT_SYMBOL_CHANNELS.TRADE]: [],
         [USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE]: [],
         [USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER]: [],
         [USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION]: [],
         [USER_WS_CLIENT_ADDRESS_CHANNELS.MATCHING]: [],
         [USER_WS_RESPONSE_RESULT]: [],
      } as Record<
         USER_WS_CLIENT_SYMBOL_CHANNELS | USER_WS_CLIENT_ADDRESS_CHANNELS | typeof USER_WS_RESPONSE_RESULT,
         WsHandlerCallback[]
      >;
   }

   /**
    * Sets the user account address for address-based subscriptions.
    * @param {string} address The user wallet address.
    */
   setUserAccountAddress(address: string): void {
      this.userAccountAddress = address;
   }

   /**
    *
    * @summary Subscribe to a channel and symbol
    * @param {USER_WS_CLIENT_SYMBOL_CHANNELS} channel User Symbol Channel
    * @param {string} symbol Symbol, send `*` for market channel to subscribe to all the available symbols
    * @param {string} [requestId] Unique Request Id, Optional
    */
   subscribeSymbol(
      channel: USER_WS_CLIENT_SYMBOL_CHANNELS,
      symbol: string,
      requestId?: string
   ) {
      const message: UserWsRequest = {
         id: requestId ?? undefined, // Ensure id is undefined if not provided, matching original optional behavior
         method: PUBLIC_WS_REQUEST_TYPES.SUBSCRIBE,
         subscription: { channel, symbol },
      };

      this.send(message); // Uses BaseWsClient's send method
   }

   /**
    *
    * @summary Subscribe to a channel and address
    * @param {USER_WS_CLIENT_ADDRESS_CHANNELS} channel  User Address Channel
    * @param {string} [address] User Wallet Address, defaults to this.userAccountAddress
    * @param {string} [requestId] Unique Request Id, Optional
    */
   subscribeAddress(
      channel: USER_WS_CLIENT_ADDRESS_CHANNELS,
      address?: string,
      requestId?: string
   ) {
      const effectiveAddress = address || this.userAccountAddress;
      if (!effectiveAddress) {
         throw new Error("No address provided and no userAccountAddress set.");
      }
      const message: UserWsRequest = {
         id: requestId ?? undefined,
         method: PUBLIC_WS_REQUEST_TYPES.SUBSCRIBE,
         subscription: { channel, address: effectiveAddress },
      };

      this.send(message);
   }

   /**
    *
    * @summary Unsubscribe to a channel and symbol
    * @param {USER_WS_CLIENT_SYMBOL_CHANNELS} channel User Symbol Channel
    * @param {string} symbol Symbol, send `*` for market channel to unsubscribe to all the available symbols
    * @param {string} [requestId] Unique Request Id, Optional
    */
   unsubscribeSymbol(
      channel: USER_WS_CLIENT_SYMBOL_CHANNELS,
      symbol: string,
      requestId?: string
   ) {
      const message: UserWsRequest = {
         id: requestId ?? undefined,
         method: PUBLIC_WS_REQUEST_TYPES.UNSUBSCRIBE,
         subscription: { channel, symbol },
      };

      this.send(message);
   }

   /**
    *
    * @summary Unsubscribe to a channel and address
    * @param {USER_WS_CLIENT_ADDRESS_CHANNELS} channel User Address Channel
    * @param {string} [address] User Wallet Address, defaults to this.userAccountAddress
    * @param {string} [requestId] Unique Request Id, Optional
    */
   unsubscribeAddress(
      channel: USER_WS_CLIENT_ADDRESS_CHANNELS,
      address?: string,
      requestId?: string
   ) {
      const effectiveAddress = address || this.userAccountAddress;
      if (!effectiveAddress) {
         throw new Error("No address provided and no userAccountAddress set.");
      }
      const message: UserWsRequest = {
         id: requestId ?? undefined,
         method: PUBLIC_WS_REQUEST_TYPES.UNSUBSCRIBE,
         subscription: { channel, address: effectiveAddress },
      };

      this.send(message);
   }

   // Type guard for UserPureOperationResponse
   private isUserPureOperationResponse(message: any): message is UserPureOperationResponse {
      return message && typeof message === 'object' && message.result === USER_WS_RESPONSE_RESULT &&
         'id' in message && 'success' in message && 'code' in message && 'ts' in message;
      // data and error are optional in OperationResponse, so not checking them for type guarding
   }

   // Type guard for UserSubscriptionPush
   private isSubscriptionPushMessage(message: any): message is UserSubscriptionPush {
      return (message && typeof message === 'object' && typeof message.channel === 'string' && message.result === undefined && 'data' in message);
   }

   // Implement the abstract handleMessage from BaseWsClient
   protected handleMessage(message: UserWsResponse): void {
      if (this.isUserPureOperationResponse(message)) {
         return this.handleOperationResponse(message);
      }
      if (this.isSubscriptionPushMessage(message)) {
         return this.handlePushMessage(message);
      }
      // If message is neither UserPureOperationResponse nor UserSubscriptionPush,
      // but was typed as UserWsResponse, this indicates a potential issue with type definitions or message source.
      console.warn(`UserWsClient: Unhandled UserWsResponse variant:`, message);
   }

   protected handleOperationResponse(message: UserPureOperationResponse): void {
      if (!this._handlers.hasOwnProperty(message.result)) {
         return
      }

      const callbacks = this._handlers[message.result];
      if (callbacks && callbacks.length > 0) {
         for (const callback of callbacks) {
            try { callback(message); } catch (e) { console.error("Error in UserWsClient Operation Response handler:", e); }
         }
      }
   }

   protected handlePushMessage(message: UserSubscriptionPush): void {
      const channelKey = message.channel as USER_WS_CLIENT_SYMBOL_CHANNELS | USER_WS_CLIENT_ADDRESS_CHANNELS;
      if (!this._handlers.hasOwnProperty(channelKey)) {
         return
      }

      const callbacks = this._handlers[channelKey];
      if (callbacks && callbacks.length > 0) {
         for (const callback of callbacks) {
            try { callback(message.data); } catch (e) { console.error("Error in UserWsClient Subscription Push handler:", e); }
         }
      }
   }
}
