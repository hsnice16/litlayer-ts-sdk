import axios, { AxiosInstance, AxiosError } from "axios";
import {
   getHeaders,
   getReadonlyHeaders
} from "../utils"
import {
   CHAINS,
   PLATFORMS,
   GenericObject,
   ENVIRONMENT,
   AuthenticatedHeaders,
   ReadonlyHeaders,
   GenericAPIResponse,
} from "../types"
import { createWalletClient, http, Account as ViemAccount, WalletClient } from "viem";
import { LitlayerApiError, HttpError } from "../error"
import { removeLeadingSlashes, getAPIErrorMsg } from "../utils"
import { IHttpClient } from "./IHttpClient"

export class AxiosHttpClient implements IHttpClient {
   private baseUrl: string;
   private platform: PLATFORMS;
   private chainId: CHAINS;
   private mainAccount: WalletClient;
   private agent: WalletClient;
   private environment: ENVIRONMENT;
   private axiosInstance: AxiosInstance;

   constructor(
      baseUrl: string,
      environment: ENVIRONMENT,
      platform: PLATFORMS,
      chainId: CHAINS,
      mainAccount: ViemAccount,
      agent: ViemAccount,
   ) {
      this.baseUrl = removeLeadingSlashes(baseUrl);
      this.platform = platform;
      this.chainId = chainId;
      this.mainAccount = createWalletClient({ account: mainAccount, transport: http("http://localhost") });
      this.agent = createWalletClient({ account: agent, transport: http("http://localhost") });
      this.environment = environment;
      this.axiosInstance = axios.create({
         baseURL: this.baseUrl,
      });
   }

   private async getAuthHeaders(
      payload: GenericObject<any>,
   ): Promise<AuthenticatedHeaders> {
      return getHeaders(
         this.baseUrl, // Note: getHeaders might need adjustment if it relies on a full URL for signing
         this.platform,
         this.chainId,
         this.agent,
         this.mainAccount,
         payload,
         this.environment
      );
   }

   private getReadonlyHeaders(): ReadonlyHeaders {
      return getReadonlyHeaders(this.platform, this.chainId);
   }

   private parseResponse<T>(responseData: any, status: number, path?: string): T {
      // Assuming responseData is already parsed by Axios
      const apiData = responseData as GenericAPIResponse<T>;

      if (!apiData.success) {
         throw new LitlayerApiError(apiData.code, getAPIErrorMsg(apiData.code, apiData.msg), apiData as any);
      }
      return apiData.data;
   }

   private handleError(error: any, path?: string): never {
      if (axios.isAxiosError(error)) {
         const axiosError = error as AxiosError<GenericAPIResponse<any> & { code: number; msg: string }>;
         const response = axiosError.response;
         const request = axiosError.request;

         if (response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const responseData = response.data;
            let apiCode = response.status;
            let apiMsg = "Http error with no message";

            if (responseData && typeof responseData === 'object') {
               apiCode = typeof responseData.code === 'number' ? responseData.code : response.status;
               apiMsg = typeof responseData.msg === 'string' ? responseData.msg : JSON.stringify(responseData);
            } else if (typeof responseData === 'string') {
               apiMsg = responseData;
            }

            throw new LitlayerApiError(apiCode, getAPIErrorMsg(apiCode, apiMsg), responseData as any);

         } else if (request) {
            // The request was made but no response was received
            throw new HttpError(0, `No response received for request to ${path}: ${axiosError.message}`);
         } else {
            // Something happened in setting up the request that triggered an Error
            throw new HttpError(0, `Error setting up request to ${path}: ${axiosError.message}`);
         }
      }
      // Non-Axios error
      throw new HttpError(0, `An unexpected error occurred: ${error.message || String(error)}`);
   }


   async healthCheck(): Promise<boolean> {
      try {
         const response = await this.axiosInstance.get("/health");
         return response.status === 200;
      } catch (error) {
         return false; // Or handle more gracefully
      }
   }

   async get<T>(
      path: string,
      queryParams?: Record<string, string | number | boolean | undefined>,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T> {
      const readonlyHeaders = this.getReadonlyHeaders();
      const headers: Record<string, string> = {
         "X-Platform": String(readonlyHeaders["X-Platform"]),
         "X-Chain-EVM-Id": String(readonlyHeaders["X-Chain-EVM-Id"]),
         ...(requestSpecificHeaders || {}),
      };

      try {
         const response = await this.axiosInstance.get(path, {
            params: queryParams,
            headers: headers,
         });
         return this.parseResponse<T>(response.data, response.status, path);
      } catch (error) {
         this.handleError(error, path);
      }
   }

   async post<T>(
      path: string,
      body: GenericObject<any>,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T> {
      const authHeaders = await this.getAuthHeaders(body);
      const headers: Record<string, string> = {
         "X-Platform": String(authHeaders["X-Platform"]),
         "X-Chain-EVM-Id": String(authHeaders["X-Chain-EVM-Id"]),
         "X-Nonce": String(authHeaders["X-Nonce"]),
         "X-Signature": authHeaders["X-Signature"],
         ...(requestSpecificHeaders || {}),
      };

      try {
         const response = await this.axiosInstance.post(path, body, { headers });
         return this.parseResponse<T>(response.data, response.status, path);
      } catch (error) {
         this.handleError(error, path);
      }
   }

   async put<T>(
      path: string,
      body: GenericObject<any>,
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T> {
      const authHeaders = await this.getAuthHeaders(body);
      const headers: Record<string, string> = {
         "X-Platform": String(authHeaders["X-Platform"]),
         "X-Chain-EVM-Id": String(authHeaders["X-Chain-EVM-Id"]),
         "X-Nonce": String(authHeaders["X-Nonce"]),
         "X-Signature": authHeaders["X-Signature"],
         ...(requestSpecificHeaders || {}),
      };

      try {
         const response = await this.axiosInstance.put(path, body, { headers });
         return this.parseResponse<T>(response.data, response.status, path);
      } catch (error) {
         this.handleError(error, path);
      }
   }

   async delete<T>(
      path: string,
      body: GenericObject<any> | undefined, // Axios delete typically sends body in config.data
      requestSpecificHeaders?: GenericObject<string>
   ): Promise<T> {
      const authHeaders = await this.getAuthHeaders(body || {});
      const headers: Record<string, string> = {
         "X-Platform": String(authHeaders["X-Platform"]),
         "X-Chain-EVM-Id": String(authHeaders["X-Chain-EVM-Id"]),
         "X-Nonce": String(authHeaders["X-Nonce"]),
         "X-Signature": authHeaders["X-Signature"],
         ...(requestSpecificHeaders || {}),
      };

      try {
         const response = await this.axiosInstance.delete(path, {
            headers,
            data: body // Axios uses `data` for DELETE request body
         });
         return this.parseResponse<T>(response.data, response.status, path);
      } catch (error) {
         this.handleError(error, path);
      }
   }

   get Account(): ViemAccount {
      return this.mainAccount.account!;
   }

   get Agent(): ViemAccount {
      return this.agent.account!;
   }

   get ChainId(): CHAINS {
      return this.chainId;
   }

   get Platform(): PLATFORMS {
      return this.platform;
   }

   get Environment(): ENVIRONMENT {
      return this.environment;
   }
} 