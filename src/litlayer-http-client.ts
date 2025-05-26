import { Account as ViemAccount } from 'viem';
import { CHAINS, PLATFORMS, ENVIRONMENT } from './types';
import { generateAgentAccount } from './utils';
import { FetchHttpClient } from './clients/fetch-http-client';
import { IHttpClient } from './IHttpClient';

import { History } from './apis/history';
import { User } from './apis/user';
import { Order } from './apis/order';
import { Position } from './apis/position';
import { Global } from './apis/global';
import { Oracle } from './apis/oracle';

export interface LitlayerHttpClientConfig {
   chainId: CHAINS;
   platform: PLATFORMS;
   account: ViemAccount;
   baseUrl: string;
   agent?: ViemAccount;
   environment: ENVIRONMENT;
   httpClient?: IHttpClient;
}

export class LitlayerHttpClient {
   private _config: LitlayerHttpClientConfig;
   private _httpClient: IHttpClient;
   private _user: User;
   private _history: History;
   private _order: Order;
   private _position: Position;
   private _global: Global;
   private _oracle: Oracle;

   constructor(config: LitlayerHttpClientConfig) {
      this._config = config;
      if (config.httpClient) {
         this._httpClient = config.httpClient;
      } else {
         this._httpClient = new FetchHttpClient(
            config.baseUrl,
            config.environment,
            config.platform,
            config.chainId,
            config.account,
            config.agent ?? generateAgentAccount(),
         );
      }

      this._history = new History(this._httpClient);
      this._order = new Order(this._httpClient);
      this._position = new Position(this._httpClient);
      this._user = new User(this._httpClient);
      this._global = new Global(this._httpClient);
      this._oracle = new Oracle(this._httpClient);
   }

   static async create(
      chainId: CHAINS,
      platform: PLATFORMS,
      environment: ENVIRONMENT,
      userAccount: ViemAccount,
      baseUrl: string,
      agentAccount?: ViemAccount,
      customHttpClient?: IHttpClient,
   ): Promise<LitlayerHttpClient> {
      const agent = agentAccount ?? generateAgentAccount();

      const config: LitlayerHttpClientConfig = {
         chainId,
         platform,
         account: userAccount,
         baseUrl,
         agent,
         environment,
         httpClient: customHttpClient,
      };

      return new LitlayerHttpClient(config);
   }

   get config(): LitlayerHttpClientConfig {
      return this._config;
   }

   get httpClient(): IHttpClient {
      return this._httpClient;
   }

   get chainId() {
      return this._config.chainId;
   }

   get platform() {
      return this._config.platform;
   }

   get account() {
      return this._config.account;
   }

   get agentAccount(): ViemAccount | undefined {
      return this._config.agent;
   }

   /**
    *
    * @summary Litlayer HTTP Client Global's APIs
    */
   get global() {
      return this._global;
   }

   /**
    *
    * @summary Litlayer HTTP Client History's APIs
    */
   get history() {
      return this._history;
   }

   /**
    *
    * @summary Litlayer HTTP Client Oracle's APIs
    */
   get oracle() {
      return this._oracle;
   }

   /**
    *
    * @summary Litlayer HTTP Client Order's APIs
    */
   get order() {
      return this._order;
   }

   /**
    *
    * @summary Litlayer HTTP Client Position's APIs
    */
   get position() {
      return this._position;
   }

   /**
    *
    * @summary Litlayer HTTP Client User's APIs
    */
   get user() {
      return this._user;
   }

   /**
    *
    * @summary Check Litlayer HTTP Client Health
    * @returns {Promise<boolean>} Promise
    */
   async checkHealth(): Promise<boolean> {
      return this._global.checkHealth();
   }
}
