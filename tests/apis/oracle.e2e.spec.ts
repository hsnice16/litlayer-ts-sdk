import { privateKeyToAccount, Account } from 'viem/accounts';
import { describe, expect, test, beforeAll } from 'vitest';

import { CHAINS, ENVIRONMENT, FetchHttpClient, generateAgentAccount, PLATFORMS } from '../../src';
import { Oracle } from '../../src/apis/oracle';

describe('Oracle API tests', () => {
   let client: FetchHttpClient;
   let oracleApi: Oracle;
   let mainAccount: Account;
   let agentAccount: Account;

   beforeAll(async () => {
      const privateKey = (process.env.PRIV_KEY ?? '') as `0x${string}`;
      if (!privateKey) {
         throw new Error('PRIV_KEY is missing in env');
      }
      const httpUrl = process.env.HTTP_URL ?? '';
      if (!httpUrl) {
         throw new Error('HTTP_URL is missing in env');
      }
      mainAccount = privateKeyToAccount(privateKey);
      agentAccount = generateAgentAccount();
      client = new FetchHttpClient(
         httpUrl,
         ENVIRONMENT.TESTNET,
         PLATFORMS.STELLA,
         CHAINS.BERA_BEPOLIA,
         mainAccount,
         agentAccount,
      );
      oracleApi = new Oracle(client);
   });

   test('oracle.getPrice should have the ETH symbol', async () => {
      const price = await oracleApi.getPrice('ETH');
      console.log(price);
      expect(price.symbol).toEqual('ETH');
   });
   test('oracle.getPrice should have the BTC symbol', async () => {
      const price = await oracleApi.getPrice('BTC');
      console.log(price);
      expect(price.symbol).toEqual('BTC');
   });

   test('oracle.getPrice with timestamp should have the ETH symbol', async () => {
      const currentTimestamp = Math.floor(Date.now() / 1000) - 2;
      const price = await oracleApi.getPrice('ETH', currentTimestamp);
      const expected = 'ETH';
      console.log(price);
      expect(price.symbol).toEqual(expected);
      // Check if the timestamp in response is close to the requested one
      // Allow for a small difference due to server processing and clock skew
      expect(new Date(price.ts).getTime() / 1000 - currentTimestamp).toBeLessThanOrEqual(5);
   });

   test('oracle.getMarkPrice should return a number', async () => {
      const markPrice = await oracleApi.getMarkPrice('ETH');
      console.log(markPrice);
      expect(typeof markPrice).toBe('number');
      expect(markPrice).toBeGreaterThan(100);
   });

   test('oracle.getIndexPrice should return a number', async () => {
      const indexPrice = await oracleApi.getIndexPrice('ETH');
      console.log(indexPrice);
      expect(typeof indexPrice).toBe('number');
      expect(indexPrice).toBeGreaterThan(100);
   });

   test('oracle.getHistoricalprice should have string `s` in response with length greater than or equal to 0', async () => {
      const currentDateInSeconds = Math.floor(Date.now() / 1000);
      const price = await oracleApi.getHistoricalPrice(
         'ETH',
         'index',
         currentDateInSeconds - 1000,
         currentDateInSeconds,
         '15m',
         10,
      );
      console.log(price);
      const expected = 0;
      expect(price.s.length).toBeGreaterThanOrEqual(expected);
   });
});
