import { privateKeyToAccount, Account } from "viem/accounts";
import { describe, expect, test, beforeAll } from "vitest";

import {
   CHAINS,
   ENVIRONMENT,
   PLATFORMS,
   LitlayerHttpClient,
} from "../src";

describe("LitlayerHttpClient -- fetch Comprehensive Tests", () => {
   let client: LitlayerHttpClient;
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

      // Instantiate LitlayerHttpClient
      client = await LitlayerHttpClient.create(
         CHAINS.BERA_BEPOLIA,
         PLATFORMS.STELLA,
         ENVIRONMENT.TESTNET,
         mainAccount,
         httpUrl
      );
   });

   test("LitlayerHttpClient should be initialized", () => {
      expect(client).toBeDefined();
   });

   test("LitlayerHttpClient.checkHealth should return true", async () => {
      const health = await client.checkHealth();
      expect(health).toBe(true);
   });

   test("Global module should be accessible and getChains should work", async () => {
      expect(client.global).toBeDefined();
      const chains = await client.global.getChains();
      expect(chains).toBeDefined();
      expect(Array.isArray(chains)).toBe(true);
      // Assuming getChains returns an array, and we expect at least one chain for 'bepolia'
      const bepoliaChain = chains.find(chain => chain.code.toLowerCase() === 'bepolia');
      expect(bepoliaChain).toBeDefined();
   });

   test("History module should be accessible and queryDeposits should work", async () => {
      expect(client.history).toBeDefined();
      const deposits = await client.history.queryDeposits();
      expect(deposits).toBeDefined();
      expect(deposits.list).toBeDefined(); // Based on HistoryQueryDepositsResponse structure
      expect(deposits.total).toBeGreaterThanOrEqual(0);
   });

   test("Oracle module should be accessible and getPrice should work", async () => {
      expect(client.oracle).toBeDefined();
      const price = await client.oracle.getPrice("ETH");
      expect(price).toBeDefined();
      expect(price.symbol).toEqual("ETH");
   });

   test("Order module should be accessible and queryOpenOrders should work", async () => {
      expect(client.order).toBeDefined();
      const openOrders = await client.order.queryOpenOrders();
      expect(openOrders).toBeDefined();
      expect(openOrders.list).toBeDefined(); // Based on OrderQueryOpenOrdersResponse structure
      expect(openOrders.total).toBeGreaterThanOrEqual(0);
   });

   test("Position module should be accessible and queryOpenPositions should work", async () => {
      expect(client.position).toBeDefined();
      const openPositions = await client.position.queryOpenPositions();
      expect(openPositions).toBeDefined();
      expect(openPositions.list).toBeDefined(); // Based on PositionQueryResponse structure
      expect(openPositions.total).toBeGreaterThanOrEqual(0);
   });

   test("User module should be accessible and queryProfile should work", async () => {
      expect(client.user).toBeDefined();
      const profile = await client.user.queryProfile();
      expect(profile).toBeDefined();
      expect(profile.address.toLowerCase()).toEqual(mainAccount.address.toLowerCase());
   });
});

