export enum CHAINS {
   BERA_MAINNET = 80094,
   BERA_BEPOLIA = 80069,
}

export enum PLATFORMS {
   STELLA = "stella",
}

export enum ENVIRONMENT {
   TESTNET = "Testnet",
   MAINNET = "Mainnet",
}

export type GenericObject<T> = Record<string, T>;

/**
 * Request Types
 */

export enum HTTP_METHODS {
   GET = "GET",
   POST = "POST",
   PUT = "PUT",
   DELETE = "DELETE",
}

export interface ReadonlyHeaders {
   "X-Platform": PLATFORMS;
   "X-Chain-EVM-Id": CHAINS;
}

export interface AuthenticatedHeaders extends ReadonlyHeaders {
   "X-Nonce": number;
   "X-Signature": string;
}

export type GenericAPIResponse<T> =
   | { success: true; data: T; ts: number; code: number; }
   | { success: false; msg: string; code: number; };

/**
 * Global Types
 */

export interface GlobalChainsResponse {
   name: string;
   code: string;
   evm_id: number;
   description: string;
}

export interface GlobalPairsResponse {
   name: string;
   symbol: string;
   price_decimal: number;
   quantity_decimal: number;
   max_leverage: number;
   maintenance_margin_rate: string;
   vrpr: string;
   description: string;
}

/**
 * History Types
 */

export enum HistoryQuerySortDir {
   ASC = "asc",
   DESC = "desc",
}

export enum HistoryQueryDepositsSortBy {
   AMOUNT = "amount",
   DEPOSIT_TIME = "deposit_time",
}

export interface HistoryQueryDepositsResponseList {
   amount: number;
   balance_new: number;
   balance_old: number;
   deposit_time: string;
   recipient: string;
   tx_hash: string;
}

export enum HistoryQueryFundsSortBy {
   FEE = "fee",
   FUND_TIME = "fund_time",
   RATE = "rate",
}

export interface HistoryQueryFundsResponseList {
   direction: string;
   fee: number;
   fund_time: string;
   fund_type: number;
   rate: number;
   symbol: string;
}

export enum HistoryQueryOrdersSortBy {
   FEE = "fee",
   ORDER_TIME = "order_time",
   PNL = "pnl",
   ENTRY_PRICE = "entry_price",
}

export interface HistoryQueryOrdersResponseList {
   direction: string;
   entry_price: number;
   fee: number;
   order_no: string;
   order_time: string;
   pnl: number;
   status: number;
   symbol: string;
   type: string;
}

export enum HistoryQueryTradesSortBy {
   FEE = "fee",
   PNL = "pnl",
   PRICE = "price",
   QUANTITY = "quantity",
   TRADE_TIME = "trade_time",
}

export interface HistoryQueryTradesResponseList {
   direction: string;
   fee: number;
   pnl: number;
   price: number;
   quantity: number;
   symbol: string;
   trade_time: string;
   type: string;
}

export enum HistoryQueryWithdrawsSortBy {
   AMOUNT = "amount",
   WITHDRAW_TIME = "withdraw_time",
}

export interface HistoryQueryWithdrawsResponseList {
   amount: number;
   balance_new: number;
   balance_old: number;
   recipient: string;
   tx_hash: string;
   withdraw_completed: boolean;
   withdraw_time: string;
}

/**
 * Oracle Types
 */

export type OraclePriceResponseLatestPrice = {
   index_price: number;
   mark_price: number;
};

export interface OraclePriceResponse {
   currency: string;
   latest_price: OraclePriceResponseLatestPrice;
   name: string;
   slug: string;
   symbol: string;
   ts: string;
}

export interface OracleHistoricalPriceResponse {
   s: string;
   t: number[];
   o: number[];
   h: number[];
   l: number[];
   c: number[];
   v: number[];
}

/**
 * Order Types
 */

export enum OrderQuerySortDir {
   ASC = "asc",
   DESC = "desc",
}

export enum OrderQueryOpenOrdersSortBy {
   SUBMIT_TIME = "submit_time",
   PRICE = "price",
   QUANTITY = "quantity",
}

export enum OrderDirection {
   LONG = "L",
   SHORT = "S",
}

export enum OrderType {
   MARKET = "M",
   LIMIT = "L",
   TAKE_PROFIT = "T",
   STOP_LOSS = "S",
}

export interface OrderQueryOpenOrdersResponseList {
   direction: OrderDirection;
   expiry_time: string;
   freeze_amount: string;
   leverage: number;
   order_no: string;
   price: string;
   quantity: string;
   settle_amount: string;
   settle_quantity: string;
   slippage: string;
   submit_time: string;
   symbol: string;
   type: OrderType;
   client_order_id?: string;
}

export type OrderQueryOpenOrdersResponse = QueryResponse<OrderQueryOpenOrdersResponseList>;

export type CloseTPSLOrderPayload = {
   position_no: string;
   sl_price?: string;
   tp_price?: string;
};

export type CreateOrder = {
   direction: OrderDirection;
   expiry_time: number;
   leverage: number;
   price: string;
   quantity: string;
   slippage: string;
   symbol: string;
   type: OrderType;
   client_order_id?: string;
};

export type MutateOrderResponse = {
   order_no: string;
   client_order_id?: string;
};

/**
 * Position Types
 */

export interface PositionData {
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
}

export interface QueryResponse<T> {
   total: number;
   relation: string;
   list: null | T[];
}

export enum PositionQuerySortDir {
   ASC = "asc",
   DESC = "desc",
}

export enum PositionQueryClosedPositionsSortBy {
   PNL = "pnl",
   OPEN_TIME = "open_time",
   FEE = "fee",
   FUNDING_FEE = "funding_fee",
}

/**
 * User Types
 */

export interface UserQuerySubAccountsResponse {
   sub_account_id: number;
   name: string;
   avatar: string;
   balance: string;
   freeze: string;
   upnl: string;
}

export interface UserQueryBalancesResponse {
   sub_account_id: number;
   balance: string;
   freeze: string;
}

export interface UserQueryPerformancesResponse {
   sub_account_id: number;
   trade_volume: string;
   pnl: string;
}

export interface UserQueryProfile {
   address: string;
   nickname: string;
   marketMaker: boolean;
}

export interface UserCreateAccount {
   sub_account_id: number;
}

/**
 * Signer Types
 */

export interface LitlayerTypedDataDomain {
   chainId: null | number | string;
   name: null | string;
   version: null | string;
}

export interface LitlayerTypedDataField {
   name: string;
   type: string;
}


export interface LitlayerTypedDataDomain {
   chainId: null | number | string;
   name: null | string;
   version: null | string;
}
