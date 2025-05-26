import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import UserWsClient and any necessary mocks or dependencies
import { UserWsClient } from '../../src/ws/user-ws-client';
import {
   PUBLIC_WS_REQUEST_TYPES,
   USER_WS_CLIENT_SYMBOL_CHANNELS,
   USER_WS_CLIENT_ADDRESS_CHANNELS,
} from '../../src/ws/types';
import { USER_WS_RESPONSE_RESULT } from '../../src/ws/constants';

describe('UserWsClient', () => {
   let client: UserWsClient;
   let sendSpy: ReturnType<typeof vi.spyOn>;

   beforeEach(() => {
      client = new UserWsClient('ws://test');
      sendSpy = vi.spyOn(client as any, 'send');
   });

   it('should be defined', () => {
      expect(UserWsClient).toBeDefined();
   });

   // it('should set user account address', () => {
   //    const address = '0x27a81Df55b225b1d30b0eE214f620Fc06F4fCe9b';
   //    client.setUserAccountAddress(address);
   //    expect(client.userAccountAddress).toBe(address);
   // });

   it('should send correct message for subscribeSymbol', () => {
      client.subscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, 'ETH', 'req-1');
      expect(sendSpy).toHaveBeenCalledWith({
         id: 'req-1',
         method: PUBLIC_WS_REQUEST_TYPES.SUBSCRIBE,
         subscription: { channel: USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, symbol: 'ETH' },
      });
   });

   it('should handle operation response for subscribeSymbol', () => {
      const opHandler = vi.fn();
      // @ts-ignore
      client._handlers[USER_WS_RESPONSE_RESULT].push(opHandler);
      // Simulate sending subscribe
      client.subscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, 'ETH', 'req-1');
      // Simulate receiving operation response
      const opResponse = {
         id: 'req-1',
         result: USER_WS_RESPONSE_RESULT,
         success: true,
         code: 0,
         ts: Date.now(),
      };
      // @ts-ignore
      client.handleMessage(opResponse);
      expect(opHandler).toHaveBeenCalledWith(opResponse);
   });

   it('should handle push message after subscription', () => {
      const pushHandler = vi.fn();
      // @ts-ignore
      client._handlers[USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET].push(pushHandler);
      // Simulate receiving a push message
      const pushMsg = {
         channel: USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET,
         data: { symbol: 'ETH', price: '3000' },
      };
      // @ts-ignore
      client.handleMessage(pushMsg);
      expect(pushHandler).toHaveBeenCalledWith(pushMsg.data);
   });

   it('should send correct message for subscribeAddress with explicit address', () => {
      client.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, '0xabc', 'req-2');
      expect(sendSpy).toHaveBeenCalledWith({
         id: 'req-2',
         method: PUBLIC_WS_REQUEST_TYPES.SUBSCRIBE,
         subscription: { channel: USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, address: '0xabc' },
      });
   });

   it('should handle operation response for subscribeAddress', () => {
      const opHandler = vi.fn();
      // @ts-ignore
      client._handlers[USER_WS_RESPONSE_RESULT].push(opHandler);
      client.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, '0xabc', 'req-2');
      const opResponse = {
         id: 'req-2',
         result: USER_WS_RESPONSE_RESULT,
         success: true,
         code: 0,
         ts: Date.now(),
      };
      // @ts-ignore
      client.handleMessage(opResponse);
      expect(opHandler).toHaveBeenCalledWith(opResponse);
   });

   it('should handle push message for address channel', () => {
      const pushHandler = vi.fn();
      // @ts-ignore
      client._handlers[USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE].push(pushHandler);
      const pushMsg = {
         channel: USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE,
         data: { address: '0xabc', balance: '100' },
      };
      // @ts-ignore
      client.handleMessage(pushMsg);
      expect(pushHandler).toHaveBeenCalledWith(pushMsg.data);
   });

   it('should send correct message for subscribeAddress with setUserAccountAddress', () => {
      client.setUserAccountAddress('0xdef');
      client.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, undefined, 'req-3');
      expect(sendSpy).toHaveBeenCalledWith({
         id: 'req-3',
         method: PUBLIC_WS_REQUEST_TYPES.SUBSCRIBE,
         subscription: { channel: USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, address: '0xdef' },
      });
   });

   it('should throw if subscribeAddress called without address', () => {
      expect(() => client.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE)).toThrow();
   });

   it('should send correct message for unsubscribeSymbol', () => {
      client.unsubscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, 'BTC', 'req-4');
      expect(sendSpy).toHaveBeenCalledWith({
         id: 'req-4',
         method: PUBLIC_WS_REQUEST_TYPES.UNSUBSCRIBE,
         subscription: { channel: USER_WS_CLIENT_SYMBOL_CHANNELS.MARKET, symbol: 'BTC' },
      });
   });

   it('should send correct message for unsubscribeAddress with explicit address', () => {
      client.unsubscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER, '0x123', 'req-5');
      expect(sendSpy).toHaveBeenCalledWith({
         id: 'req-5',
         method: PUBLIC_WS_REQUEST_TYPES.UNSUBSCRIBE,
         subscription: { channel: USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER, address: '0x123' },
      });
   });

   it('should send correct message for unsubscribeAddress with setUserAccountAddress', () => {
      client.setUserAccountAddress('0x456');
      client.unsubscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER, undefined, 'req-6');
      expect(sendSpy).toHaveBeenCalledWith({
         id: 'req-6',
         method: PUBLIC_WS_REQUEST_TYPES.UNSUBSCRIBE,
         subscription: { channel: USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER, address: '0x456' },
      });
   });

   it('should throw if unsubscribeAddress called without address', () => {
      expect(() => client.unsubscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.ORDER)).toThrow();
   });
});
