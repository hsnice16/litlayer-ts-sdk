import { IHttpClient } from '../IHttpClient';
import { validateStringRequiredParameter } from '../utils';
import { z } from 'zod/v4';
import {
   CreateOrderSchema,
   CancelOrderSchema,
   CancelOrdersSchema,
   CloseTPSLOrderSchema,
} from './schemas/order';

import {
   MutateOrderResponse,
   CloseTPSLOrderPayload,
   CreateOrder as CreateOrderType,
   OrderDirection,
   OrderQueryOpenOrdersResponseList,
   OrderQueryOpenOrdersSortBy,
   OrderQuerySortDir,
   OrderType,
   GenericObject,
   QueryResponse,
} from '../types';

export class Order {
   private internalHttpClient: IHttpClient;
   private mainAccount: string;

   constructor(client: IHttpClient) {
      this.internalHttpClient = client;
      this.mainAccount = client.Account.address!;
   }

   /**
    *
    * @summary Query User's Order (Open Status)
    * @param {string} [address] User Address, Optional
    * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
    * @param {number} [p] Page No, Optional, Default 1
    * @param {number} [ps] Page Size, Optional, Default 10
    * @param {OrderQueryOpenOrdersSortBy} [sortBy] Sort By, Optional
    * @param {OrderQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
    * @throws {InvalidParameterError} RequiredError
    * @returns {OrderQueryOpenOrdersResponse} Promise
    */
   async queryOpenOrders(
      address?: string,
      subAccount?: number,
      p?: number,
      ps?: number,
      sortBy?: OrderQueryOpenOrdersSortBy,
      sortDir?: OrderQuerySortDir,
   ): Promise<QueryResponse<OrderQueryOpenOrdersResponseList>> {
      const userAddress = address ? address : this.mainAccount;
      validateStringRequiredParameter(userAddress, 'userAddress');

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      queryParams.p = p ?? 1;
      queryParams.ps = ps ?? 10;
      queryParams.sortDir = sortDir ?? OrderQuerySortDir.ASC;
      if (sortBy) queryParams.sortBy = sortBy;

      const extraHeaders: GenericObject<string> = {};
      extraHeaders['X-Sub-Account'] = String(subAccount ?? 0);

      const urlPath = `v1/order/${userAddress}`;
      return this.internalHttpClient.get<QueryResponse<OrderQueryOpenOrdersResponseList>>(
         urlPath,
         queryParams,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Submit a cancel order for user
    * @param {string} [orderNo] Order Number, Optional
    * @param {string} [clientOrderId] Client Order ID, Optional
    * @throws {InvalidParameterError} RequiredError
    * @returns {MutateOrderResponse} Promise
    */
   async cancel(orderNo?: string, clientOrderId?: string): Promise<MutateOrderResponse> {
      const payloadToValidate = {
         order_no: orderNo,
         client_order_id: clientOrderId,
      };

      const validatedPayload = CancelOrderSchema.parse(payloadToValidate);

      const urlPath = 'v1/order/cancel';
      // Construct payload only with properties that are actually present
      const payload: GenericObject<any> = {};
      if (validatedPayload.order_no) payload.order_no = validatedPayload.order_no;
      if (validatedPayload.client_order_id)
         payload.client_order_id = validatedPayload.client_order_id;

      return this.internalHttpClient.post<MutateOrderResponse>(urlPath, payload);
   }

   /**
    *
    * @summary Submit a list of orders to cancel for user
    * @param {string[]} [orderNos] Order Numbers, Optional
    * @param {string[]} [clientOrderIds] Client Order IDs, Optional
    * @throws {InvalidParameterError} RequiredError
    * @returns {MutateOrderResponse[]} Promise
    */
   async cancels(orderNos?: string[], clientOrderIds?: string[]): Promise<MutateOrderResponse[]> {
      const payloadToValidate = {
         order_nos: orderNos,
         client_order_ids: clientOrderIds,
      };
      const validatedPayload = CancelOrdersSchema.parse(payloadToValidate);

      const urlPath = 'v1/orders/cancel';
      const payload: GenericObject<any> = {};
      if (validatedPayload.order_nos) payload.order_no = validatedPayload.order_nos; // API expects order_no (singular) for array
      if (validatedPayload.client_order_ids)
         payload.client_order_id = validatedPayload.client_order_ids; // API expects client_order_id (singular) for array

      return this.internalHttpClient.post<MutateOrderResponse[]>(urlPath, payload);
   }

   /**
    *
    * @summary Submit a new order for user
    * @param {OrderDirection} direction Order Direction
    * @param {number} expiryTime Order Expiry Time
    * @param {number} leverage Order Leverage
    * @param {string} price Order Price
    * @param {string} quantity Order Quantity
    * @param {string} slippage Order Slippage
    * @param {string} symbol Pair Symbol
    * @param {OrderType} type Order Type
    * @param {string} [mmUuid] MM UUID, Optional
    * @param {string} [clientOrderId] Client Order ID, Optional
    * @throws {InvalidParameterError} RequiredError
    * @returns {MutateOrderResponse} Promise
    */
   async create(
      direction: OrderDirection,
      expiryTime: number,
      leverage: number,
      price: string,
      quantity: string,
      slippage: string,
      symbol: string,
      type: OrderType,
      mmUuid?: string,
      clientOrderId?: string,
   ): Promise<MutateOrderResponse> {
      const payloadToValidate: CreateOrderType = {
         direction,
         expiry_time: expiryTime,
         leverage,
         price,
         quantity,
         slippage,
         symbol,
         type,
         client_order_id: clientOrderId,
      };

      const validatedPayload = CreateOrderSchema.parse(payloadToValidate);

      const urlPath = 'v1/order/create';
      return this.internalHttpClient.post<MutateOrderResponse>(urlPath, validatedPayload);
   }

   /**
    *
    * @summary Submit a new limit order for user
    * @param {OrderDirection} direction Order Direction
    * @param {number} expiryTime Order Expiry Time
    * @param {number} leverage Order Leverage
    * @param {string} price Order Price
    * @param {string} quantity Order Quantity
    * @param {string} symbol Pair Symbol
    * @param {string} [mmUuid] MM UUID, Optional
    * @param {string} [clientOrderId] Client Order ID, Optional
    * @throws {InvalidParameterError} RequiredError
    * @returns {MutateOrderResponse} Promise
    */
   async createLimit(
      direction: OrderDirection,
      expiryTime: number,
      leverage: number,
      price: string,
      quantity: string,
      symbol: string,
      clientOrderId?: string,
   ): Promise<MutateOrderResponse> {
      return this.create(
         direction,
         expiryTime,
         leverage,
         price,
         quantity,
         '0',
         symbol,
         OrderType.LIMIT,
         clientOrderId,
      );
   }

   /**
    *
    * @summary Submit a new market order for user
    * @param {OrderDirection} direction Order Direction
    * @param {number} expiryTime Order Expiry Time
    * @param {number} leverage Order Leverage
    * @param {string} price Order Price
    * @param {string} quantity Order Quantity
    * @param {string} slippage Order Slippage
    * @param {string} symbol Pair Symbol
    * @param {string} [mmUuid] MM UUID, Optional
    * @param {string} [clientOrderId] Client Order ID, Optional
    * @throws {InvalidParameterError} RequiredError
    * @returns {MutateOrderResponse} Promise
    */
   async createMarket(
      direction: OrderDirection,
      expiryTime: number,
      leverage: number,
      price: string,
      quantity: string,
      slippage: string,
      symbol: string,
      clientOrderId?: string,
   ): Promise<MutateOrderResponse> {
      return this.create(
         direction,
         expiryTime,
         leverage,
         price,
         quantity,
         slippage,
         symbol,
         OrderType.MARKET,
         clientOrderId,
      );
   }

   /**
    *
    * @summary Submit a new list of orders for user
    * @param {CreateOrderType[]} orders List of Orders
    * @throws {InvalidParameterError} RequiredError
    * @returns {MutateOrderResponse[]} Promise
    */
   async creates(orders: CreateOrderType[]): Promise<MutateOrderResponse[]> {
      const OrdersArraySchema = z
         .array(CreateOrderSchema)
         .min(1, { message: 'Orders array cannot be empty.' });
      const validatedOrders = OrdersArraySchema.parse(orders);

      const urlPath = 'v1/orders/create';
      return this.internalHttpClient.post<MutateOrderResponse[]>(urlPath, validatedOrders);
   }

   /**
    *
    * @summary Submit a TP/SL close position order for user
    * @param {string} positionNo Position Number
    * @param {string} [slPrice] Stop Loss Price, Optional
    * @param {string} [tpPrice] Take Profit Price, Optional
    * @throws {InvalidParameterError} RequiredError
    * @returns {string} Promise
    */
   async closeTPSL(positionNo: string, slPrice?: string, tpPrice?: string): Promise<string> {
      const payloadToValidate = {
         position_no: positionNo,
         sl_price: slPrice,
         tp_price: tpPrice,
      };
      const validatedPayload = CloseTPSLOrderSchema.parse(payloadToValidate);

      const urlPath = 'v1/order/tpslclose';
      const payload: CloseTPSLOrderPayload = {
         position_no: validatedPayload.position_no,
      };
      if (validatedPayload.sl_price) payload.sl_price = validatedPayload.sl_price;
      if (validatedPayload.tp_price) payload.tp_price = validatedPayload.tp_price;

      return this.internalHttpClient.post<string>(urlPath, payload);
   }
}
