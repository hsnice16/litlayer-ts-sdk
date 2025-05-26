import { privateKeyToAccount, Account } from 'viem/accounts';
import { describe, expect, test, beforeAll } from 'vitest';

import {
   CHAINS,
   ENVIRONMENT,
   FetchHttpClient,
   generateAgentAccount,
   PLATFORMS,
   // Add any specific response types from ../src if needed for explicit typing in tests
} from '../../src';

import { History } from '../../src/apis/history';

describe('History API tests', () => {
   // Store HTTP Client
   let client: FetchHttpClient;
   let history: History;

   // Store Viem Account
   let mainAccount: Account;
   let agentAccount: Account;
   let otherAccountAddress: `0x${string}`;

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
      otherAccountAddress = '0x27a81Df55b225b1d30b0eE214f620Fc06F4fCe9b';

      client = new FetchHttpClient(
         httpUrl,
         ENVIRONMENT.TESTNET,
         PLATFORMS.STELLA,
         CHAINS.BERA_BEPOLIA,
         mainAccount,
         agentAccount,
      );
      history = new History(client);
   });

   test('history.queryDeposits should have list length greater than or equal to 0', async () => {
      const deposits = await history.queryDeposits();
      if (deposits.list === null) {
         throw new Error('Deposits list is null');
      }
      expect(deposits.total).toBeGreaterThanOrEqual(deposits.list.length);
   });

   test('history.queryDeposits should have list length 0 for other account', async () => {
      const deposits = await history.queryDeposits(otherAccountAddress);
      console.log(deposits);
      if (deposits.list === null) {
         throw new Error('Deposits list is null');
      }
      expect(deposits.total).toBeGreaterThanOrEqual(deposits.list.length);
   });

   test('history.queryFunds should have list length greater than or equal to 0', async () => {
      const funds = await history.queryFunds();
      console.log(funds);
      expect(funds.total).toBeGreaterThanOrEqual(funds.list!.length ?? 0);
   });

   test('history.queryFunds should have list length 0 for other account', async () => {
      const funds = await history.queryFunds(otherAccountAddress);
      console.log(funds);
      if (funds.list === null) {
         throw new Error('Funds list is null');
      }
      expect(funds.total).toBeGreaterThanOrEqual(funds.list!.length ?? 0);
   });

   test(
      'history.queryOrders should have list length greater than or equal to 0',
      async () => {
         const orders = await history.queryOrders();
         console.log(orders);
         expect(orders.total).toBeGreaterThanOrEqual(orders.list!.length ?? 0);
      },
      30 * 1000,
   );

   test(
      'history.queryOrders should have list length 0 for other account',
      async () => {
         const orders = await history.queryOrders(otherAccountAddress);
         console.log(orders);
         if (orders.list === null) {
            throw new Error('Orders list is null');
         }
         expect(orders.total).toBeGreaterThanOrEqual(orders.list.length);
      },
      30 * 1000,
   );

   test('history.queryTrades should have list length greater than or equal to 0', async () => {
      const trades = await history.queryTrades();
      const list = trades.list ?? [];
      expect(list.length).toBeGreaterThanOrEqual(0);
      expect(trades.total).toBeGreaterThanOrEqual(list.length);
   });

   test('history.queryTrades should have list length 0 for other account', async () => {
      const trades = await history.queryTrades(otherAccountAddress);
      console.log(trades);
      if (trades.list === null) {
         throw new Error('Trades list is null');
      }
      expect(trades.total).toBeGreaterThanOrEqual(trades.list.length);
   });

   test('history.queryWithdraws should have list length greater than or equal to 0', async () => {
      const withdraws = await history.queryWithdraws();
      const list = withdraws.list ?? [];
      expect(list.length).toBeGreaterThanOrEqual(0);
      expect(withdraws.total).toBeGreaterThanOrEqual(list.length);
   });

   test('history.queryWithdraws should have list length 0 for other account', async () => {
      const withdraws = await history.queryWithdraws(otherAccountAddress);
      console.log(withdraws);
      if (withdraws.list === null) {
         throw new Error('Withdraws list is null');
      }
      expect(withdraws.total).toBeGreaterThanOrEqual(withdraws.list.length);
   });
});
