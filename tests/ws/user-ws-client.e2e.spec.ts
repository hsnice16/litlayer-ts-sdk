import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserWsClient } from '../../src/ws/user-ws-client';
import { USER_WS_CLIENT_SYMBOL_CHANNELS } from '../../src/ws/types';
import { USER_WS_RESPONSE_RESULT } from '../../src/ws/constants';

describe('UserWsClient E2E', () => {
   let client: UserWsClient;
   let opResponse: any = null;
   let pushMessage: any = null;

   beforeAll(async () => {
      // Use a hardcoded WS URL for this test
      const WS_URL = 'wss://testnet.v2.stellaxyz.io/v1/ws';
      client = new UserWsClient(WS_URL);

      // Patch handleMessage to log and check every message
      const origHandleMessage = client['handleMessage'].bind(client);
      client['handleMessage'] = (msg: any) => {
         // Log every message
         // eslint-disable-next-line no-console
         console.log('[E2E WS MESSAGE]', JSON.stringify(msg));
         // Unified handler logic
         if (msg.result === USER_WS_RESPONSE_RESULT && msg.id === 'e2e-req-1') {
            opResponse = msg;
         }
         if (msg.channel === USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET && msg.data?.symbol === 'ETH') {
            pushMessage = msg.data;
         }
         origHandleMessage(msg);
      };

      // Connect to the real WebSocket server
      client.connect();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for connection
   }, 10000);

   afterAll(async () => {
      if (client) {
         client.disconnect();
      }
   });

   it('should subscribe to a symbol channel and receive operation response and push message', async () => {
      // Subscribe to a symbol
      const reqId = 'e2e-req-1';
      client.subscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, 'ETH', reqId);

      // Wait for operation response
      await new Promise<void>((resolve, reject) => {
         const timeout = setTimeout(
            () => reject(new Error('Timeout waiting for opResponse')),
            10000,
         );
         const check = () => {
            if (opResponse) {
               clearTimeout(timeout);
               try {
                  expect(opResponse).toBeDefined();
                  expect(opResponse.id).toBe(reqId);
                  expect(opResponse.result).toBe(USER_WS_RESPONSE_RESULT);
                  resolve();
               } catch (e) {
                  reject(e);
               }
            } else {
               setTimeout(check, 100);
            }
         };
         check();
      });

      // Wait for at least one push message
      await new Promise<void>((resolve, reject) => {
         const timeout = setTimeout(
            () => reject(new Error('Timeout waiting for pushMessage')),
            15000,
         );
         const check = () => {
            if (pushMessage) {
               clearTimeout(timeout);
               try {
                  expect(pushMessage).toBeDefined();
                  expect(pushMessage.symbol).toBe('ETH');
                  resolve();
               } catch (e) {
                  reject(e);
               }
            } else {
               setTimeout(check, 100);
            }
         };
         check();
      });
   }, 30000);
});
