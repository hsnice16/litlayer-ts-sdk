import { IHttpClient } from "../IHttpClient"
import { GlobalChainsResponse, GlobalPairsResponse } from "../types"

export class Global {
   constructor(private readonly client: IHttpClient) { }
   /**
    *
    * @summary Health Check
    * @throws {RequiredError} RequiredError
    * @returns {Promise<{ msg: string }>} Promise
    */
   async checkHealth(): Promise<boolean> {
      return this.client.healthCheck()
   }

   /**
    *
    * @summary Get LitLayer Chain Definition
    * @throws {RequiredError} RequiredError
    * @returns {Promise<GlobalChainsResponse[]>} Promise
    */
   async getChains(): Promise<GlobalChainsResponse[]> {
      const urlPath = "v1/global/chains";
      return this.client.get<GlobalChainsResponse[]>(urlPath);
   }

   /**
    *
    * @summary Get LitLayer Trading Pair Definition
    * @throws {RequiredError} RequiredError
    * @returns {Promise<GlobalPairsResponse[]>} Promise
    */
   async getPairs(): Promise<GlobalPairsResponse[]> {
      const urlPath = "v1/global/pairs";
      return this.client.get<GlobalPairsResponse[]>(urlPath);
   }
}
