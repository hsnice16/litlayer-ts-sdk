import { IHttpClient } from "../IHttpClient";
import { validateStringRequiredParameter } from "../utils";

import {
  PositionQueryClosedPositionsSortBy,
  PositionQuerySortDir,
  GenericObject,
  PositionData,
  QueryResponse,
} from "../types";
import { CloseOrderSchema } from "./schemas/order";

export class Position {
  private client: IHttpClient;
  private mainAccount: string;

  constructor(client: IHttpClient) {
    this.client = client;
    this.mainAccount = client.Account.address!;
  }

  /**
   * @summary Query User's Position (Open Status)
   * @param {string} [address] User Address, Optional
   * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
   * @throws {RequiredError} RequiredError
   * @returns {PositionQueryResponse} Promise
   */
  async queryOpenPositions(
    address?: string,
    subAccount?: number
  ): Promise<QueryResponse<PositionData>> {
    const userAddress = address ? address : this.mainAccount;
    validateStringRequiredParameter(userAddress, "userAddress");

    const urlPath = `v1/position/${userAddress}`;
    const extraHeaders: GenericObject<string> = {};
    extraHeaders["X-Sub-Account"] = String(subAccount ?? 0);
    return this.client.get<QueryResponse<PositionData>>(
      urlPath,
      undefined,
      extraHeaders
    );
  }

  /**
   *
   * @summary Submit a close position order for user
   * @param {string} closeQuantity Close Quantity
   * @param {string} positionNo Position Number
   * @param {string} price Slippage Adjusted Market Price
   * @throws {InvalidParameterError} RequiredError
   * @returns {string} Promise<OrderId>
   */
  async close(
    closeQuantity: string,
    positionNo: string,
    price: string
  ): Promise<string> {
    const payloadToValidate = {
      close_quantity: closeQuantity,
      position_no: positionNo,
      price: price,
    };

    const payload = CloseOrderSchema.parse(payloadToValidate);
    const urlPath = "v1/order/close";
    return this.client.post<string>(urlPath, payload);
  }

  /**
   *
   * @summary Query User's Closed Position
   * @param {string} [address] User Address, Optional
   * @param {number} [subAccount] Sub Account, Optional, 0 if not provided
   * @param {string} [asset] Asset Symbol, Optional
   * @param {number} [fromDate] From Date in timestamp, Optional
   * @param {number} [toDate] To Date in timestamp, Optional
   * @param {number} [p] Page No, Optional, Default 1
   * @param {number} [ps] Page Size, Optional, Default 10
   * @param {PositionQueryClosedPositionsSortBy} [sortBy] Sort By, Optional
   * @param {PositionQuerySortDir} [sortDir] Sort Direction, Optional, Default asc
   * @throws {RequiredError} RequiredError
   * @returns {PositionQueryResponse} Promise
   */
  async queryClosedPositions(
    address?: string,
    subAccount?: number,
    asset?: string,
    fromDate?: number,
    toDate?: number,
    p?: number,
    ps?: number,
    sortBy?: PositionQueryClosedPositionsSortBy,
    sortDir?: PositionQuerySortDir
  ): Promise<QueryResponse<PositionData>> {
    const userAddress = address ? address : this.mainAccount;
    validateStringRequiredParameter(userAddress, "userAddress");

    const queryParams: Record<string, string | number | boolean | undefined> =
      {};
    queryParams.p = p ?? 1;
    queryParams.ps = ps ?? 10;
    queryParams.sortDir = sortDir ?? PositionQuerySortDir.ASC;

    if (sortBy) queryParams.sortBy = sortBy;
    if (asset) queryParams.asset = asset;
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;

    const extraHeaders: GenericObject<string | number> = {};
    extraHeaders["X-Sub-Account"] = subAccount ?? 0;

    const urlPath = `v1/position/close/${userAddress}`;

    return this.client.get<QueryResponse<PositionData>>(
      urlPath,
      queryParams,
      extraHeaders as GenericObject<string>
    );
  }
}
