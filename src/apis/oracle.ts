import { validateRequiredParameter, validateStringRequiredParameter } from '../utils';
import { OracleHistoricalPriceResponse, OraclePriceResponse } from '../types';
import { IHttpClient } from '../clients/IHttpClient';

export class Oracle {
   private client: IHttpClient;
   private priceCache: Map<string, OraclePriceResponse> = new Map();

   constructor(client: IHttpClient) {
      this.client = client;
   }

   /**
    *
    * @summary Get Oracle Price
    * @param {string} symbol Trading Pair Symbol
    * @param {number} [ts] Timestamp, Optional
    * @throws {RequiredError} RequiredError
    * @returns {Promise<OraclePriceResponse>} Promise
    */
   async getPrice(symbol: string, ts?: number): Promise<OraclePriceResponse> {
      validateStringRequiredParameter(symbol, 'symbol');

      const queryParams: Record<string, string | number | boolean | undefined> = {};
      if (ts) {
         queryParams.ts = ts;
      }

      // Return the price cache if within 2 seconds
      const cachedPrice = this.priceCache.get(symbol);
      if (cachedPrice) {
         const cacheTime = new Date(cachedPrice.ts).getTime();
         if (Date.now() - cacheTime < 1000 * 2) {
            return cachedPrice;
         }
      }

      const urlPath = `v1/price/${symbol}`;
      const response = await this.client.get<OraclePriceResponse>(urlPath, queryParams);
      this.priceCache.set(symbol, response);
      return response;
   }

   /**
    * @summary Get Mark Price
    * @param {string} symbol Trading Pair Symbol
    * @param {number} [ts] Timestamp, Optional
    * @throws {RequiredError} RequiredError
    * @returns {Promise<Number>} Promise
    */
   async getMarkPrice(symbol: string): Promise<number> {
      const priceData = await this.getPrice(symbol);
      return priceData.latest_price.mark_price;
   }

   /**
    * @summary Get Index Price
    * @param {string} symbol Trading Pair Symbol
    * @param {number} [ts] Timestamp, Optional
    * @throws {RequiredError} RequiredError
    * @returns {Promise<Number>} Promise
    */
   async getIndexPrice(symbol: string): Promise<Number> {
      const priceData = await this.getPrice(symbol);
      return priceData.latest_price.index_price;
   }

   /**
    *
    * @summary Get Oracle Historical Price
    * @param {string} symbol Trading Pair Symbol
    * @param {string} type Type of Price, e.g. index, mark, funding
    * @param {number} fromTimestamp From Timestamp (in seconds)
    * @param {number} toTimestamp To Timestamp (in seconds)
    * @param {string} resolution Resolution, e.g. 1m, 5m, 15m, 1h, 1d, 1w, 1M
    * @param {number} count Count of Candles, Optional
    * @throws {RequiredError} RequiredError
    * @returns {Promise<OracleHistoricalPriceResponse>} Promise
    */
   async getHistoricalPrice(
      symbol: string,
      type: string,
      fromTimestamp: number,
      toTimestamp: number,
      resolution: string,
      count?: number,
   ): Promise<OracleHistoricalPriceResponse> {
      validateStringRequiredParameter(symbol, 'symbol');
      validateStringRequiredParameter(type, 'type');
      validateRequiredParameter(fromTimestamp, 'fromTimestamp');
      validateRequiredParameter(toTimestamp, 'toTimestamp');
      validateStringRequiredParameter(resolution, 'resolution');

      const queryParams: Record<string, string | number | boolean | undefined> = {
         symbol,
         type,
         f: fromTimestamp,
         t: toTimestamp,
         r: resolution,
      };

      if (count) {
         queryParams.c = count;
      }

      const urlPath = `v1/price/historical/${symbol}`;
      return this.client.get<OracleHistoricalPriceResponse>(urlPath, queryParams);
   }
}
