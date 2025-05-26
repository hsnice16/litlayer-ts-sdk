import { getHeaders, getReadonlyHeaders } from '../utils';
import {
   CHAINS,
   PLATFORMS,
   HTTP_METHODS,
   GenericObject,
   ENVIRONMENT,
   AuthenticatedHeaders,
   ReadonlyHeaders,
   GenericAPIResponse,
} from '../types';
import { createWalletClient, http, Account as ViemAccount, WalletClient } from 'viem';
import { LitlayerApiError, HttpError } from '../error';
import { removeLeadingSlashes, getHttpErrorMsg, getAPIErrorMsg } from '../utils';
import { IHttpClient } from './IHttpClient';

export class FetchHttpClient implements IHttpClient {
   private baseUrl: string;
   private platform: PLATFORMS;
   private chainId: CHAINS;
   private mainAccount: WalletClient;
   private agent: WalletClient;
   private environment: ENVIRONMENT;

   constructor(
      baseUrl: string,
      environment: ENVIRONMENT,
      platform: PLATFORMS,
      chainId: CHAINS,
      mainAccount: ViemAccount,
      agentAccount: ViemAccount,
   ) {
      this.baseUrl = baseUrl;
      this.platform = platform;
      this.chainId = chainId;
      this.mainAccount = createWalletClient({
         account: mainAccount,
         transport: http('http://localhost'),
      });
      this.agent = createWalletClient({
         account: agentAccount,
         transport: http('http://localhost'),
      });
      this.environment = environment;
   }
   private async getAuthHeaders(payload: GenericObject<any>): Promise<AuthenticatedHeaders> {
      return getHeaders(
         this.baseUrl,
         this.platform,
         this.chainId,
         this.agent,
         this.mainAccount,
         payload,
         this.environment,
      );
   }

   private getReadonlyHeaders(): ReadonlyHeaders {
      return getReadonlyHeaders(this.platform, this.chainId);
   }

   private async parseResponse<T>(response: Response, path?: string): Promise<T> {
      // HTTP layer error
      if (!response.ok) {
         throw new HttpError(response.status, getHttpErrorMsg(response.status));
      }

      const responseText = await response.text();
      const apiData = JSON.parse(responseText) as GenericAPIResponse<T>;
      if (!apiData.success) {
         throw new LitlayerApiError(apiData.code, apiData.msg, apiData);
      }
      return apiData.data;
   }

   async healthCheck(): Promise<boolean> {
      const url = `${removeLeadingSlashes(this.baseUrl)}/health`;
      const options: RequestInit = {
         method: HTTP_METHODS.GET,
      };

      const response = await fetch(url, options);
      return response.status === 200;
   }

   async get<T>(
      path: string,
      queryParams?: Record<string, string | number | boolean | undefined>,
      requestSpecificHeaders?: GenericObject<string>,
   ): Promise<T> {
      let fullPath = path;
      if (queryParams) {
         const params = new URLSearchParams();
         for (const key in queryParams) {
            if (queryParams[key] !== undefined) {
               params.append(key, String(queryParams[key]));
            }
         }
         if (params.toString()) {
            fullPath += `?${params.toString()}`;
         }
      }

      const readonlyHeaders = this.getReadonlyHeaders();
      const headers: Record<string, string> = {
         'X-Platform': String(readonlyHeaders['X-Platform']),
         'X-Chain-EVM-Id': String(readonlyHeaders['X-Chain-EVM-Id']),
         ...(requestSpecificHeaders || {}),
      };

      const url = `${removeLeadingSlashes(this.baseUrl)}/${fullPath}`;
      const options: RequestInit = {
         method: HTTP_METHODS.GET,
         headers,
      };

      const response = await fetch(url, options);
      return this.parseResponse<T>(response, path);
   }

   async post<T>(
      path: string,
      body: GenericObject<any>,
      requestSpecificHeaders?: GenericObject<string>,
   ): Promise<T> {
      const authHeaders = await this.getAuthHeaders(body);
      const headers: Record<string, string> = {
         'X-Platform': String(authHeaders['X-Platform']),
         'X-Chain-EVM-Id': String(authHeaders['X-Chain-EVM-Id']),
         'X-Nonce': String(authHeaders['X-Nonce']),
         'X-Signature': authHeaders['X-Signature'],
         ...(requestSpecificHeaders || {}),
      };

      const url = `${removeLeadingSlashes(this.baseUrl)}/${path}`;
      const options: RequestInit = {
         method: HTTP_METHODS.POST,
         headers,
         body: JSON.stringify(body),
      };

      const response = await fetch(url, options);
      return this.parseResponse<T>(response);
   }

   async put<T>(
      path: string,
      body: GenericObject<any>,
      requestSpecificHeaders?: GenericObject<string>,
   ): Promise<T> {
      const authHeaders = await this.getAuthHeaders(body);
      const headers: Record<string, string> = {
         'X-Platform': String(authHeaders['X-Platform']),
         'X-Chain-EVM-Id': String(authHeaders['X-Chain-EVM-Id']),
         'X-Nonce': String(authHeaders['X-Nonce']),
         'X-Signature': authHeaders['X-Signature'],
         ...(requestSpecificHeaders || {}),
      };

      const url = `${removeLeadingSlashes(this.baseUrl)}/${path}`;
      const options: RequestInit = {
         method: HTTP_METHODS.PUT,
         headers,
         body: JSON.stringify(body),
      };

      const response = await fetch(url, options);
      return this.parseResponse<T>(response);
   }

   async delete<T>(
      path: string,
      body: GenericObject<any> | undefined,
      requestSpecificHeaders?: GenericObject<string>,
   ): Promise<T> {
      const authHeaders = await this.getAuthHeaders(body || {});
      const headers: Record<string, string> = {
         'X-Platform': String(authHeaders['X-Platform']),
         'X-Chain-EVM-Id': String(authHeaders['X-Chain-EVM-Id']),
         'X-Nonce': String(authHeaders['X-Nonce']),
         'X-Signature': authHeaders['X-Signature'],
         ...(requestSpecificHeaders || {}),
      };

      const url = `${removeLeadingSlashes(this.baseUrl)}/${path}`;
      const options: RequestInit = {
         method: HTTP_METHODS.DELETE,
         headers,
      };

      if (body) {
         options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      return this.parseResponse<T>(response);
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
