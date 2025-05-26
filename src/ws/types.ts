import { WalletClient } from 'viem';
import { CHAINS, OrderDirection, OrderType, CreateOrder, PLATFORMS, ENVIRONMENT } from '../types';
import {
   USER_WS_RESPONSE_RESULT,
   MM_WS_LOGIN_RESPONSE_RESULT,
   MM_WS_POST_RESPONSE_RESULT,
} from './constants';

/**
 * Config types
 */

export interface WebSocketCreateOptions {
   chainId: CHAINS;
   platform: PLATFORMS;
   mainAccount: WalletClient;
   environment: ENVIRONMENT;
}

/**
 * Request Types
 */

export enum WEB_SOCKET_TYPES {
   PUBLIC = 'user',
   MARKET_MARKET = 'mm',
}

export enum PUBLIC_WS_REQUEST_TYPES {
   SUBSCRIBE = 'subscribe',
   UNSUBSCRIBE = 'unsubscribe',
}

export interface UserWsRequest {
   id?: string;
   method: PUBLIC_WS_REQUEST_TYPES;
   subscription: {
      channel: USER_WS_CLIENT_SYMBOL_CHANNELS | USER_WS_CLIENT_ADDRESS_CHANNELS;
      symbol?: string;
      address?: string;
   };
}

/**
 * Responses
 */

// Base for responses that are direct replies to an operation
// R = result type string (e.g., "subscriptionResponse", "loginResponse")
// D = data payload for the operation's response
export type OperationResponse<R extends string, D = undefined> = {
   id: string; // Correlates to request id, should be present even if empty string
   result: R;
   success: boolean;
   code: number; // Error code, 0 for success
   error?: string; // Error message if success is false
   data?: D; // Data payload, structure depends on R and success status
   ts: number; // Timestamp of response generation from server
};

// Base for unsolicited messages pushed for an active subscription
// C = channel name string (e.g., "orderbook", "jitauction")
// D = data payload for the subscription push
export type SubscriptionPush<C extends string, D> = {
   channel: C;
   data: D;
   ts?: number; // Optional: Timestamp of data generation or push
};

export type UserWsOrderBookResponseDataList = {
   px: string; // Price
   sz: string; // Size
};

export interface UserWsOrderBookResponseData {
   symbol: string;
   time: number;
   asks: UserWsOrderBookResponseDataList[];
   bids: UserWsOrderBookResponseDataList[];
}

export interface UserWsTradeResponseData {
   px: string;
   side: string;
   symbol: string;
   sz: string;
   time: number;
}

export type UserWsMarketResponseDataPrice = {
   cur: number;
   past24h: number;
};

export interface UserWsMarketResponseData {
   fundingRate: number;
   markPx: number;
   nextFundingTime: number;
   oi: number;
   px: UserWsMarketResponseDataPrice;
   symbol: string;
   vol24h: number;
}

export enum BALANCE_RESPONSE_DATA_CHANGE_TYPES {
   DEPOSIT = 'deposit',
   WITHDRAW = 'withdraw',
   TRANSFER_FUND = 'transfer_fund',
   DELETE_ACCOUNT = 'delete_account',
   SETTLEMENT_CLEARING = 'settlement_clearing',
   FUNDING_FEE = 'funding_fee',
}

export interface UserWsBalanceResponseData {
   balance_old: string;
   balance_new: string;
   change_type: BALANCE_RESPONSE_DATA_CHANGE_TYPES;
   sub_account_id: number;
}

export type UserWsPositionResponseDataPosition = {
   position_no: string;
   symbol: string;
   side: string;
   leverage: number;
   entry_price: string;
   quantity: string;
   quantity_closed: string;
   average_close_price: string;
   entry_notion: string;
   funding_fee: string;
   fee: string;
   pnl: string;
   open_time: string;
   tp_order_no: string;
   tp_price: string;
   sl_order_no: string;
   sl_price: string;
};

export enum POSITION_RESPONSE_DATA_CHANGE_TYPES {
   NEW_POSITION = 'new_position',
   CLOSE_POSITION = 'close_position',
   SIZE_CHANGE = 'size_change',
   LIQUIDATION = 'liquidation',
}

export interface UserWsPositionResponseData {
   sub_account_id: number;
   position: UserWsPositionResponseDataPosition;
   change_type: POSITION_RESPONSE_DATA_CHANGE_TYPES;
}

export type UserWsOrderResponseDataOrder = {
   order_no: string;
   symbol: string;
   direction: string;
   type: string;
   price: string;
   quantity: string;
   slippage: string;
   leverage: number;
   submit_time: string;
   expiry_time: string;
   freeze_amount: string;
   settle_quantity: string;
   settle_amount: string;
};

export enum ORDER_RESPONSE_DATA_CHANGE_TYPES {
   CANCELED_ORDER = 'canceled_order',
   EXPIRED_ORDER = 'expired_order',
   NEW_ORDER = 'new_order',
   DONE_ORDER = 'done_order',
   SIZE_CHANGE = 'size_change',
}

export interface UserWsOrderResponseData {
   sub_account_id: number;
   order: UserWsOrderResponseDataOrder;
   change_type: ORDER_RESPONSE_DATA_CHANGE_TYPES;
}

// --- User Data Structures (These should already be defined above this point in the file) ---
// UserWsOrderBookResponseDataList, UserWsOrderBookResponseData, UserWsTradeResponseData,
// UserWsMarketResponseDataPrice, UserWsMarketResponseData, BALANCE_RESPONSE_DATA_CHANGE_TYPES,
// UserWsBalanceResponseData, UserWsPositionResponseDataPosition, POSITION_RESPONSE_DATA_CHANGE_TYPES,
// UserWsPositionResponseData, UserWsOrderResponseDataOrder, ORDER_RESPONSE_DATA_CHANGE_TYPES, UserWsOrderResponseData

// --- MM Request Data Structures (Restore these) ---
export interface MmWsLimitOrderRequestData {
   symbol: string;
   direction: OrderDirection;
   type: OrderType.LIMIT;
   price: string;
   quantity: string;
   slippage: string;
   leverage: number;
   expiry_time: number;
   mm_uuid?: string;
   client_order_id?: string;
}

export interface MmWsJitAnswerRequestData {
   symbol: string;
   direction: OrderDirection;
   expiry_time_ms: number;
   price: string;
   quantity: string;
   user_order_hash: string;
   client_order_id?: string;
}

export interface MmWsCancelOrderRequestData {
   order_no?: string;
   client_order_id?: string;
}

export type MmWsCreateOrdersRequestData = CreateOrder[];

export interface MmWsCancelOrdersRequestData {
   order_no?: string[];
   client_order_id?: string[];
}

// --- MM Request Payloads (Restore these) ---
export interface PostPayloadRequest {
   /* ... as originally defined ... */ id?: string;
   method: 'post';
   request: {
      channel:
         | MM_WS_CLIENT_CHANNELS.LIMIT_ORDER
         | MM_WS_CLIENT_CHANNELS.ANSWER_JIT
         | MM_WS_CLIENT_CHANNELS.CANCEL_ORDER
         | MM_WS_CLIENT_CHANNELS.CREATE_ORDERS
         | MM_WS_CLIENT_CHANNELS.CANCEL_ORDERS;
      data:
         | MmWsLimitOrderRequestData
         | MmWsJitAnswerRequestData
         | MmWsCancelOrderRequestData
         | MmWsCreateOrdersRequestData
         | MmWsCancelOrdersRequestData;
   };
}

export interface LoginPayloadRequest {
   /* ... as originally defined ... */ id?: string;
   method: 'login';
   authentication: {
      platform: PLATFORMS;
      chain_id: CHAINS;
      timestamp: number;
      signature: string;
   };
}

export type MmWsRequest = LoginPayloadRequest | PostPayloadRequest;

// --- MM Response Data Structures (Restore these) ---
export interface MmWsJitAuctionResponseData {
   user_order_hash: string;
   order_side: OrderDirection;
   order_quantity: number;
   pair_symbol: string;
}

export interface MmWsTradeNotificationResponseData {
   symbol: string;
   position_no: string;
   order_no: string;
   trade_hash: string;
   trade_direction: OrderDirection;
   trade_qty: number;
   trade_price: number;
   trade_time: number;
   chain: string;
}

export interface MmWsLoginResponse {
   // This is for the data field of a login OperationResponse
   success: boolean;
   message: string;
}

// --- MM Post Operation Response Data Structures (Restore these) ---
export type MmWsLimitOrderPostResponseDataData = {
   mm_uuid: string;
   order_no: string;
   client_order_id: string;
};
export interface MmWsLimitOrderPostResponseData {
   // This is a specific shape for data in a Post OperationResponse
   channel: MM_WS_CLIENT_CHANNELS.LIMIT_ORDER;
   data: MmWsLimitOrderPostResponseDataData;
}

export type MmWsCancelOrderPostResponseDataData = {
   mm_uuid: string;
   order_no: string;
   client_order_id: string;
};
export interface MmWsCancelOrderPostResponseData {
   channel: MM_WS_CLIENT_CHANNELS.CANCEL_ORDER;
   data: MmWsCancelOrderPostResponseDataData;
}

export interface MmWsAnswerJitPostResponseData {
   channel: MM_WS_CLIENT_CHANNELS.ANSWER_JIT;
   data: MmWsLimitOrderPostResponseDataData; // Re-using the limit order data structure as per original type
}

export interface MmWsCreateOrdersPostResponseData {
   channel: MM_WS_CLIENT_CHANNELS.CREATE_ORDERS;
   data: MmWsLimitOrderPostResponseDataData[];
}

export interface MmWsCancelOrdersPostResponseData {
   channel: MM_WS_CLIENT_CHANNELS.CANCEL_ORDERS;
   data: MmWsCancelOrderPostResponseDataData[];
}

// Data for USER_WS_RESPONSE_RESULT (response to subscribe/unsubscribe)
export type UserSubscriptionOperationData = UserWsRequest;

// --- User WebSocket Message Types (Corrected Definitions) ---
export type UserSubscriptionPush =
   | SubscriptionPush<USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK, UserWsOrderBookResponseData>
   | SubscriptionPush<USER_WS_CLIENT_SYMBOL_CHANNELS.TRADE, UserWsTradeResponseData[]>
   | SubscriptionPush<USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, UserWsMarketResponseData>
   | SubscriptionPush<USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, UserWsBalanceResponseData>
   | SubscriptionPush<USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION, UserWsPositionResponseData>
   | SubscriptionPush<USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER, UserWsOrderResponseData>;

export type UserPureOperationResponse = OperationResponse<
   typeof USER_WS_RESPONSE_RESULT,
   UserSubscriptionOperationData
>;

export type UserWsResponse = UserPureOperationResponse | UserSubscriptionPush;

// --- MM WebSocket Message Types (Corrected Definitions) ---
export type MmPostOperationResponseData =
   | MmWsLimitOrderPostResponseData
   | MmWsCancelOrderPostResponseData
   | MmWsAnswerJitPostResponseData
   | MmWsCreateOrdersPostResponseData
   | MmWsCancelOrdersPostResponseData;

export type MmSubscriptionPush = SubscriptionPush<
   MM_WS_CLIENT_CHANNELS.JIT_AUCTION,
   MmWsJitAuctionResponseData
>;

export type MmPureOperationResponse =
   | OperationResponse<typeof MM_WS_LOGIN_RESPONSE_RESULT, MmWsLoginResponse>
   | OperationResponse<typeof MM_WS_POST_RESPONSE_RESULT, MmPostOperationResponseData>;

export type MmWsResponse = MmPureOperationResponse | MmSubscriptionPush;

/**
 * User WebSocket Types
 */

export enum USER_WS_CLIENT_SYMBOL_CHANNELS {
   ORDER_BOOK = 'orderbook',
   TRADE = 'trade',
   MARKET = 'market',
}

export enum USER_WS_CLIENT_ADDRESS_CHANNELS {
   BALANCE = 'balance',
   POSITION = 'position',
   ORDER = 'order',
   MATCHING = 'matching',
}
/**
 * Market Maker WebSocket Types
 */

export enum MM_WS_CLIENT_CHANNELS {
   LIMIT_ORDER = 'limitorder',
   CANCEL_ORDER = 'cancelorder',
   ANSWER_JIT = 'answerjit',
   JIT_AUCTION = 'jitauction',
   CREATE_ORDERS = 'createorders',
   CANCEL_ORDERS = 'cancelorders',
}

export type MmSpecificChannels = MM_WS_CLIENT_CHANNELS;
