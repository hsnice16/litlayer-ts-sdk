import { privateKeyToAccount, Account } from "viem/accounts";
import { describe, expect, test, beforeAll } from "vitest";

import {
   CHAINS,
   ENVIRONMENT,
   generateAgentAccount,
   PLATFORMS,
} from "../../src";
import { FetchHttpClient } from "../../src/clients/fetch-http-client";
import { Global } from "../../src/apis/global"

describe("Global API tests", () => {
   // Store HTTP Client
   let client: FetchHttpClient;
   let globalApi: Global;

   // Store Viem Account
   let mainAccount: Account;
   let agentAccount: Account;

   beforeAll(async () => {
      // Initialize Private Key
      const privateKey = (process.env.PRIV_KEY ?? "") as `0x${string}`;
      if (!privateKey) {
         throw new Error("PRIV_KEY is missing in env");
      }

      // Initialize HTTP URL
      const httpUrl = process.env.HTTP_URL ?? "";
      if (!httpUrl) {
         throw new Error("HTTP_URL is missing in env");
      }

      // Initialize Account
      mainAccount = privateKeyToAccount(privateKey);
      agentAccount = generateAgentAccount();

      // Define HTTP Client
      client = new FetchHttpClient(
         httpUrl,
         ENVIRONMENT.TESTNET,
         PLATFORMS.STELLA,
         CHAINS.BERA_BEPOLIA,
         mainAccount,
         agentAccount
      );
      globalApi = new Global(client);
   });

   test("checkHealth should return true", async () => {
      const status = await globalApi.checkHealth();
      expect(status).toBe(true);
   });

   test("global.getChains should return bepolia", async () => {
      const chains = await globalApi.getChains();
      const chainsCode = chains.map((chain) => chain.code);

      const expected = ["bepolia"];
      expect(chainsCode).toEqual(expected);
   });

   test("global.getPairs should contain ETH, BTC", async () => {
      const pairs = await globalApi.getPairs();
      console.log(pairs);

      expect(pairs.length).toBeGreaterThan(5);
   });
}); 