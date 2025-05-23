import { privateKeyToAccount, Account } from "viem/accounts";
import { describe, expect, test, beforeAll } from "vitest";

import {
   CHAINS,
   ENVIRONMENT,
   PLATFORMS,
   LitlayerHttpClient,
   generateAgentAccount,
   IHttpClient,
   AxiosHttpClient,
} from "../src";

describe("LitlayerHttpClient -- with Axios Client", () => {
   let litlayerClient: LitlayerHttpClient;
   let mainAccount: Account;

   beforeAll(async () => {
      const privateKey = (process.env.PRIV_KEY ?? "") as `0x${string}`;
      if (!privateKey) {
         throw new Error("PRIV_KEY is missing in env");
      }
      const httpUrl = process.env.HTTP_URL ?? "";
      if (!httpUrl) {
         throw new Error("HTTP_URL is missing in env");
      }

      mainAccount = privateKeyToAccount(privateKey);
      const agentAccount = generateAgentAccount();

      // Instantiate AxiosHttpClient
      const customHttpClient: IHttpClient = new AxiosHttpClient(
         httpUrl,
         ENVIRONMENT.TESTNET,
         PLATFORMS.STELLA,
         CHAINS.BERA_BEPOLIA,
         mainAccount,
         agentAccount
      );

      // Instantiate LitlayerHttpClient with the custom Axios-based client
      litlayerClient = await LitlayerHttpClient.create(
         CHAINS.BERA_BEPOLIA,
         PLATFORMS.STELLA,
         ENVIRONMENT.TESTNET,
         mainAccount,
         httpUrl,
         agentAccount,
         customHttpClient
      );
   });

   test("LitlayerHttpClient (with Axios) should be initialized", () => {
      expect(litlayerClient).toBeDefined();
   });

   test("LitlayerHttpClient.checkHealth (with Axios) should return true", async () => {
      const health = await litlayerClient.checkHealth();
      expect(health).toBe(true);
   });

   test("LitlayerHttpClient should be using AxiosHttpClient", () => {
      expect(litlayerClient.httpClient instanceof AxiosHttpClient).toBe(true);
   });

   test("Global module (with Axios) getChains should work", async () => {
      expect(litlayerClient.global).toBeDefined();
      const chains = await litlayerClient.global.getChains();
      expect(chains).toBeDefined();
      expect(Array.isArray(chains)).toBe(true);
      const bepoliaChain = chains.find(chain => chain.code.toLowerCase() === 'bepolia');
      expect(bepoliaChain).toBeDefined();
   });
});
