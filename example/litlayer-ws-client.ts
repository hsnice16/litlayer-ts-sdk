import 'dotenv/config';
import {
   UserWsClient,
   USER_WS_CLIENT_SYMBOL_CHANNELS,
   USER_WS_CLIENT_ADDRESS_CHANNELS,
} from '@stellaxyz/litlayer-sdk';
import { privateKeyToAccount } from 'viem/accounts';

const signer = privateKeyToAccount(`0x${process.env.PRIVATE_KEY ?? ''}`);

// Create WebSocket client instance
const userWsClient = new UserWsClient('wss://testnet.v2.stellaxyz.io/v1/ws');

// Connect to WebSocket
userWsClient.connect();

// Example: Subscribe to orderbook updates for ETH
userWsClient.subscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK, 'ETH');
// Handle orderbook updates
userWsClient.addHandler(USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK, (data) => {
   console.log('Orderbook update:', data);
   // Unsubscribe from the orderbook channel on first message
   userWsClient.unsubscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK, 'ETH');
});

// Example: Subscribe to trade updates
userWsClient.subscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.TRADE, 'ETH');
userWsClient.addHandler(USER_WS_CLIENT_SYMBOL_CHANNELS.TRADE, (data) => {
   console.log('Trade update:', data);
});

// Example: Subscribe to balance updates
userWsClient.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE);
// You can also use the .on method as an alias for .addHandler
userWsClient.on(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, (data) => {
   console.log('Balance update:', data);
});

// Example: Subscribe to position updates
userWsClient.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION, signer.address);
userWsClient.on(USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION, (data) => {
   console.log('Position update:', data);
});

// You can also set the user account address and subscribe to position updates
userWsClient.setUserAccountAddress(signer.address);
userWsClient.subscribeAddress(USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION);
userWsClient.on(USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION, (data) => {
   console.log('Position update:', data);
});
