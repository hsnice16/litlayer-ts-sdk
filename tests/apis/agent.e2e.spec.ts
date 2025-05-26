import { privateKeyToAccount, Account } from 'viem/accounts';
import { describe, expect, test, beforeAll } from 'vitest';

import { CHAINS, ENVIRONMENT, generateAgentAccount, getHeaders, PLATFORMS } from '../../src';
import { FetchHttpClient } from '../../src/clients/fetch-http-client';
import { checkAgent } from '../../src/apis/agent';
import { http } from 'viem';
import { createWalletClient } from 'viem';

describe('Agent API tests', () => {
   // Store HTTP Client
   let client: FetchHttpClient;
   let httpUrl: string;

   // Store Viem Account
   let mainAccount: Account;
   let agentAccount: Account;

   beforeAll(async () => {
      // Initialize Private Key
      const privateKey = (process.env.PRIV_KEY ?? '') as `0x${string}`;
      if (!privateKey) {
         throw new Error('PRIV_KEY is missing in env');
      }

      // Initialize HTTP URL
      httpUrl = process.env.HTTP_URL ?? '';
      if (!httpUrl) {
         throw new Error('HTTP_URL is missing in env');
      }

      // Initialize Account
      mainAccount = privateKeyToAccount(privateKey);
      agentAccount = generateAgentAccount();
   });

   describe('checkAgent function', () => {
      test('should return a boolean status for agent check', async () => {
         const result = await checkAgent(
            httpUrl,
            CHAINS.BERA_BEPOLIA,
            PLATFORMS.STELLA,
            agentAccount.address,
         );
         expect(typeof result).toBe('boolean');
      });
   });

   describe('exchangeAgent function', () => {
      const platform = PLATFORMS.STELLA;
      const chainId = CHAINS.BERA_BEPOLIA;

      test('should return true when agent exchange is successful', async () => {
         const agentWallet = createWalletClient({
            account: agentAccount,
            transport: http('http://localhost'),
         });
         const mainWallet = createWalletClient({
            account: mainAccount,
            transport: http('http://localhost'),
         });

         let result = await checkAgent(
            httpUrl,
            CHAINS.BERA_BEPOLIA,
            PLATFORMS.STELLA,
            agentAccount.address,
         );
         expect(result).toBe(false);

         // Invoke exchange through getHeaders
         await getHeaders(
            httpUrl,
            platform,
            chainId,
            agentWallet,
            mainWallet,
            {
               chain_id: chainId,
               platform: platform,
               proxy_address: agentAccount.address,
            },
            ENVIRONMENT.TESTNET,
         );

         result = await checkAgent(
            httpUrl,
            CHAINS.BERA_BEPOLIA,
            PLATFORMS.STELLA,
            agentAccount.address,
         );
         expect(result).toBe(true);
      });
   });
});
