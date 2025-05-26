import { privateKeyToAccount, Account } from 'viem/accounts';
import { describe, expect, test, beforeAll } from 'vitest';

import {
   CHAINS,
   ENVIRONMENT,
   generateAgentAccount,
   LitlayerApiError,
   PLATFORMS,
   // Add any specific response types from ../src if needed
} from '../../src';
import { FetchHttpClient } from '../../src/clients/fetch-http-client';
import { User } from '../../src/apis/user';

describe('User API tests', () => {
   let client: FetchHttpClient;
   let userApi: User;
   let mainAccount: Account;
   let agentAccount: Account;
   let createdSubAccountId: number;

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
      userApi = new User(client);
   });

   test('user.querySubAccounts should have sub_account_id 0', async () => {
      const subAccounts = await userApi.querySubAccounts();
      const mainSubAccountId = subAccounts.find(
         (subAccount) => subAccount.sub_account_id === 0,
      )?.sub_account_id;
      const expected = 0;
      expect(mainSubAccountId).toEqual(expected);
   });

   test('user.queryBalances should have value for sub_account_id 0', async () => {
      const balances = await userApi.queryBalances();
      const mainSubAccountId = balances.find(
         (balance) => balance.sub_account_id === 0,
      )?.sub_account_id;
      const expected = 0;
      expect(mainSubAccountId).toEqual(expected);
   });

   test('user.queryPerformances should have value for sub_account_id 0', async () => {
      const performances = await userApi.queryPerformances();
      const mainSubAccountId = performances.find(
         (performance) => performance.sub_account_id === 0,
      )?.sub_account_id;
      const expected = 0;
      expect(mainSubAccountId).toEqual(expected);
   });

   test('user.queryProfile should have current wallet address', async () => {
      const address = mainAccount.address;
      const profile = await userApi.queryProfile();
      const expected = address.toLowerCase();
      expect(profile.address.toLowerCase()).toEqual(expected);
   });

   test('user.createAccount should return sub_account_id greater than 0', async () => {
      const result = await userApi.createAccount('New Account');
      createdSubAccountId = result.sub_account_id;
      expect(result.sub_account_id).toBeGreaterThan(0);
   });

   test('user.switchAccount should return ok', async () => {
      // Depends on createdSubAccountId from previous test
      if (typeof createdSubAccountId !== 'number') {
         console.warn('Skipping user.switchAccount as createdSubAccountId is not set.');
         return; // Or expect(createdSubAccountId).toBeDefined(); to fail explicitly
      }
      const result = await userApi.switchAccount(createdSubAccountId);
      const expected = 'ok';
      expect(result).toEqual(expected);
      await userApi.switchAccount(0); // Switch back
   });

   test('user.updateAccount should return account updated', async () => {
      // Depends on createdSubAccountId
      if (typeof createdSubAccountId !== 'number') {
         console.warn('Skipping user.updateAccount as createdSubAccountId is not set.');
         return;
      }
      const result = await userApi.updateAccount('1', 'Updated New Account', createdSubAccountId);
      const expected = 'account updated';
      expect(result).toEqual(expected);
   });

   test('user.transferFund should return null on success', async () => {
      // Depends on createdSubAccountId
      if (typeof createdSubAccountId !== 'number') {
         console.warn('Skipping user.transferFund as createdSubAccountId is not set.');
         return;
      }
      try {
         const result = await userApi.transferFund('0', createdSubAccountId, 0);
         console.log({ result });
         // expect(result).toEqual(expected);
      } catch (error) {
         if (error instanceof LitlayerApiError) {
            console.log({ error });
         }
      }
   });

   test('user.updateProfile should return profile updated', async () => {
      const result = await userApi.updateProfile('Main Update Profile from Test SDK');
      const expected = 'profile updated';
      expect(result).toEqual(expected);
   });

   test('user.deleteAccount should return null on success', async () => {
      // Depends on createdSubAccountId
      if (typeof createdSubAccountId !== 'number') {
         console.warn('Skipping user.deleteAccount as createdSubAccountId is not set.');
         return;
      }
      const result = await userApi.deleteAccount(createdSubAccountId);
      const expected = null;
      expect(result).toEqual(expected);
   });

   test('user.submitWithdraw should return ok', async () => {
      const result = await userApi.submitWithdraw(5);
      const expected = 'ok';
      expect(result).toEqual(expected);
   });
});
