import { IHttpClient } from '../IHttpClient';
import { validateStringRequiredParameter } from '../utils';

import {
   HistoryQueryDepositsSortBy,
   HistoryQueryDepositsResponseList,
   HistoryQueryFundsSortBy,
   HistoryQueryFundsResponseList,
   HistoryQueryOrdersSortBy,
   HistoryQueryOrdersResponseList,
   HistoryQuerySortDir,
   HistoryQueryTradesSortBy,
   HistoryQueryTradesResponseList,
   HistoryQueryWithdrawsSortBy,
   HistoryQueryWithdrawsResponseList,
   GenericObject,
   QueryResponse,
} from '../types';

export class History {
   private client: IHttpClient;
   private mainAccount: string;

   constructor(client: IHttpClient) {
      this.client = client;
      this.mainAccount = client.Account.address!;
   }

   /**
    *
    * @summary Query User's Deposit History
    * @param {string} [address] User Address, Optional
    * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
    * @param {number} [p] Page No, Optional, Default 1
    * @param {number} [ps] Page Size, Optional, Default 10
    * @param {HistoryQueryDepositsSortBy} [sortBy] Sort By, Optional
    * @param {HistoryQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
    * @throws {RequiredError} RequiredError
    * @returns {HistoryQueryDepositsResponse} Promise
    */
   async queryDeposits(
      address?: string,
      subAccount?: number,
      p?: number,
      ps?: number,
      sortBy?: HistoryQueryDepositsSortBy,
      sortDir?: HistoryQuerySortDir,
   ): Promise<QueryResponse<HistoryQueryDepositsResponseList>> {
      const userAddress = address ? address : this.mainAccount;
      validateStringRequiredParameter(userAddress, 'userAddress');

      const queryParams: Record<string, string | number | boolean | undefined> = {};

      queryParams.p = p ?? 1;
      queryParams.ps = ps ?? 10;
      queryParams.sortDir = sortDir ?? HistoryQuerySortDir.ASC;
      if (sortBy) queryParams.sortBy = sortBy;

      const extraHeaders: GenericObject<string> = {};
      extraHeaders['X-Sub-Account'] = String(subAccount ?? 0);

      const urlPath = `v1/history/deposit/${userAddress}`;

      return this.client.get<QueryResponse<HistoryQueryDepositsResponseList>>(
         urlPath,
         queryParams,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Query User's Fund History
    * @param {string} [address] User Address, Optional
    * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
    * @param {string} [asset] Asset Symbol, Optional
    * @param {number} [fromDate] From Date in timestamp, Optional
    * @param {number} [toDate] To Date in timestamp, Optional
    * @param {number} [p] Page No, Optional, Default 1
    * @param {number} [ps] Page Size, Optional, Default 10
    * @param {string} [fundType] Fund Type, Optional, comma-separated if querying more than 1, Default 0,1,2,3
    * @param {HistoryQueryFundsSortBy} [sortBy] Sort By, Optional
    * @param {HistoryQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
    * @throws {RequiredError} RequiredError
    * @returns {HistoryQueryFundsResponse} Promise
    */
   async queryFunds(
      address?: string,
      subAccount?: number,
      asset?: string,
      fromDate?: number,
      toDate?: number,
      p?: number,
      ps?: number,
      fundType?: string,
      sortBy?: HistoryQueryFundsSortBy,
      sortDir?: HistoryQuerySortDir,
   ): Promise<QueryResponse<HistoryQueryFundsResponseList>> {
      const userAddress = address ? address : this.mainAccount;
      validateStringRequiredParameter(userAddress, 'userAddress');

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      queryParams.p = p ?? 1;
      queryParams.ps = ps ?? 10;
      queryParams.fund_type = fundType ?? '0,1,2,3';
      queryParams.sortDir = sortDir ?? HistoryQuerySortDir.ASC;

      if (sortBy) queryParams.sortBy = sortBy;
      if (asset) queryParams.asset = asset;
      if (fromDate) queryParams.fromDate = fromDate;
      if (toDate) queryParams.toDate = toDate;

      const extraHeaders: GenericObject<string> = {};
      extraHeaders['X-Sub-Account'] = String(subAccount ?? 0);

      const urlPath = `v1/history/fund/${userAddress}`;

      return this.client.get<QueryResponse<HistoryQueryFundsResponseList>>(
         urlPath,
         queryParams,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Query User's Order History
    * @param {string} [address] User Address, Optional
    * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
    * @param {string} [asset] Asset Symbol, Optional
    * @param {number} [fromDate] From Date in timestamp, Optional
    * @param {number} [toDate] To Date in timestamp, Optional
    * @param {number} [p] Page No, Optional, Default 1
    * @param {number} [ps] Page Size, Optional, Default 10
    * @param {HistoryQueryOrdersSortBy} [sortBy] Sort By, Optional
    * @param {HistoryQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
    * @throws {RequiredError} RequiredError
    * @returns {HistoryQueryOrdersResponse} Promise
    */
   async queryOrders(
      address?: string,
      subAccount?: number,
      asset?: string,
      fromDate?: number,
      toDate?: number,
      p?: number,
      ps?: number,
      sortBy?: HistoryQueryOrdersSortBy,
      sortDir?: HistoryQuerySortDir,
   ): Promise<QueryResponse<HistoryQueryOrdersResponseList>> {
      const userAddress = address ? address : this.mainAccount;
      validateStringRequiredParameter(userAddress, 'userAddress');

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      queryParams.p = p ?? 1;
      queryParams.ps = ps ?? 10;
      queryParams.sortDir = sortDir ?? HistoryQuerySortDir.ASC;

      if (sortBy) queryParams.sortBy = sortBy;
      if (asset) queryParams.asset = asset;
      if (fromDate) queryParams.fromDate = fromDate;
      if (toDate) queryParams.toDate = toDate;

      const extraHeaders: GenericObject<string> = {};
      extraHeaders['X-Sub-Account'] = String(subAccount ?? 0);

      const urlPath = `v1/history/order/${userAddress}`;

      return this.client.get<QueryResponse<HistoryQueryOrdersResponseList>>(
         urlPath,
         queryParams,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Query User's Trade History
    * @param {string} [address] User Address, Optional
    * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
    * @param {string} [asset] Asset Symbol, Optional
    * @param {number} [fromDate] From Date in timestamp, Optional
    * @param {number} [toDate] To Date in timestamp, Optional
    * @param {number} [p] Page No, Optional, Default 1
    * @param {number} [ps] Page Size, Optional, Default 10
    * @param {HistoryQueryTradesSortBy} [sortBy] Sort By, Optional
    * @param {HistoryQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
    * @throws {RequiredError} RequiredError
    * @returns {HistoryQueryTradesResponse} Promise
    */
   async queryTrades(
      address?: string,
      subAccount?: number,
      asset?: string,
      fromDate?: number,
      toDate?: number,
      p?: number,
      ps?: number,
      sortBy?: HistoryQueryTradesSortBy,
      sortDir?: HistoryQuerySortDir,
   ): Promise<QueryResponse<HistoryQueryTradesResponseList>> {
      const userAddress = address ? address : this.mainAccount;
      validateStringRequiredParameter(userAddress, 'userAddress');

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      queryParams.p = p ?? 1;
      queryParams.ps = ps ?? 10;
      queryParams.sortDir = sortDir ?? HistoryQuerySortDir.ASC;

      if (sortBy) queryParams.sortBy = sortBy;
      if (asset) queryParams.asset = asset;
      if (fromDate) queryParams.fromDate = fromDate;
      if (toDate) queryParams.toDate = toDate;

      const extraHeaders: GenericObject<string> = {};
      extraHeaders['X-Sub-Account'] = String(subAccount ?? 0);

      const urlPath = `v1/history/trade/${userAddress}`;

      return this.client.get<QueryResponse<HistoryQueryTradesResponseList>>(
         urlPath,
         queryParams,
         extraHeaders,
      );
   }

   /**
    *
    * @summary Query User's Withdraw History
    * @param {string} [address] User Address, Optional
    * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
    * @param {number} [p] Page No, Optional, Default 1
    * @param {number} [ps] Page Size, Optional, Default 10
    * @param {HistoryQueryWithdrawsSortBy} [sortBy] Sort By, Optional
    * @param {HistoryQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
    * @throws {RequiredError} RequiredError
    * @returns {HistoryQueryWithdrawsResponse} Promise
    */
   async queryWithdraws(
      address?: string,
      subAccount?: number,
      p?: number,
      ps?: number,
      sortBy?: HistoryQueryWithdrawsSortBy,
      sortDir?: HistoryQuerySortDir,
   ): Promise<QueryResponse<HistoryQueryWithdrawsResponseList>> {
      const userAddress = address ? address : this.mainAccount;
      validateStringRequiredParameter(userAddress, 'userAddress');

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      queryParams.p = p ?? 1;
      queryParams.ps = ps ?? 10;
      queryParams.sortDir = sortDir ?? HistoryQuerySortDir.ASC;
      if (sortBy) queryParams.sortBy = sortBy;

      const extraHeaders: GenericObject<string> = {};
      extraHeaders['X-Sub-Account'] = String(subAccount ?? 0);

      const urlPath = `v1/history/withdraw/${userAddress}`;

      return this.client.get<QueryResponse<HistoryQueryWithdrawsResponseList>>(
         urlPath,
         queryParams,
         extraHeaders,
      );
   }
}
