# LitLayer TypeScript SDK (Stella Trade)

[![npm version](https://img.shields.io/npm/v/@stellaxyz/litlayer-sdk.svg)](https://www.npmjs.com/package/@stellaxyz/litlayer-sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)

The LitLayer TypeScript SDK provides seamless access to the LitLayer engine - the powerful infrastructure that drives Stella Trade's decentralized exchange platform. This SDK offers developers a robust interface to interact with LitLayer's core services, including order management, account operations, and real-time market data through both REST API and WebSocket endpoints. By abstracting away the complexities of direct protocol interaction, the SDK enables quick and reliable integration with LitLayer's backend services, making it the essential toolkit for building applications on top of Stella Trade's ecosystem.

## Table of Contents

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
  - [LitlayerHttpClient](#litlayerhttpclient)
  - [LitlayerWsClient](#litlayerwsclient)
- [License](#license)

## Installation

```shell
npm install @stellaxyz/litlayer-sdk
# or
yarn add @stellaxyz/litlayer-sdk
```

## Prerequisites

- Node.js (version 22.x or higher recommended)
- `viem`: 2.x
- `ws`: 8.x (for Node.js environments)
- `axios`: ^1.9.0 (if using the `axios-http-client`)

This SDK can work with different HTTP clients. If you plan to use the `axios-http-client`, ensure you have `axios` installed as a peer dependency. Other clients, like those based on `fetch`, may be used if `viem` or other underlying libraries support them.

## Usage

### Testnet Configuration
| Name         | Website                           | chainId            | platform         | environment        | baseUrl                          |
|--------------|-----------------------------------|--------------------|------------------|--------------------|----------------------------------|
| Stella Trade | https://testnet.trade.stellaxyz.io | CHAINS.BERA_BEPOLIA | PLATFORMS.STELLA | ENVIRONMENT.TESTNET | https://testnet.v2.stellaxyz.io |

### Mainnet Configuration
| Name         | Website                    | chainId             | platform         | environment        | baseUrl                   |
|--------------|----------------------------|---------------------|------------------|--------------------|---------------------------|
| Stella Trade | https://trade.stellaxyz.io | CHAINS.BERA_MAINNET | PLATFORMS.STELLA | ENVIRONMENT.MAINNET | https://v2.stellaxyz.io   |


### LitlayerHttpClient

Use `LitlayerHttpClient` to make API calls for managing user accounts, placing orders, fetching history, and more.

```ts
import { CHAINS, PLATFORMS, ENVIRONMENT, LitlayerHttpClient } from "@stellaxyz/litlayer-sdk";
import { privateKeyToAccount } from "viem/accounts";

// Replace with your actual private key
const signer = privateKeyToAccount("0xYOUR_PRIVATE_KEY");

async function main() {
   // Testnet Environment
   const litlayerHttpClient = await LitlayerHttpClient.create(
      CHAINS.BERA_BEPOLIA,
      PLATFORMS.STELLA,
      ENVIRONMENT.TESTNET,
      signer,
      "https://testnet.v2.stellaxyz.io",
   );

   // For Mainnet, use the following line instead:
   // const litlayerHttpClient = await LitlayerHttpClient.create(
   //    CHAINS.BERA_MAINNET,
   //    PLATFORMS.STELLA,
   //    ENVIRONMENT.MAINNET, // or ENVIRONMENT.MAINNET
   //    signer,
   //    "https://v2.stellaxyz.io",
   // );

   // Example: Query sub-accounts
   const subAccounts = await litlayerHttpClient.user.querySubAccounts();
   console.log("Sub Accounts:", subAccounts);

   // Example: Fetching oracle price
   const oraclePrice = await litlayerHttpClient.oracle.getPrice("ETH");
   console.log("Oracle Price for ETH:", oraclePrice);

   // Example: Check API health
   const isHealthy = await litlayerHttpClient.checkHealth();
   console.log("API Health:", isHealthy ? "Healthy" : "Unhealthy");
}

main().catch(console.error);
```
For more details, see the [HTTP Client source](./src/litlayer-http-client.ts) and [full examples](#examples).

### LitlayerWsClient

Use `LitlayerWsClient` to connect to WebSocket streams for real-time data like order books, trades, and market information.

**User (Public) WebSocket:**
```ts
import { UserWsClient } from '../src/ws/user-ws-client';
import { USER_WS_CLIENT_ADDRESS_CHANNELS, USER_WS_CLIENT_SYMBOL_CHANNELS } from '../src/ws/types';

// Create WebSocket client instance
const userWsClient = new UserWsClient("wss://testnet.v2.stellaxyz.io/v1/ws");

// Connect to WebSocket
userWsClient.connect();

// Example: Subscribe to orderbook updates for ETH
userWsClient.subscribeSymbol(
   USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK,
   'ETH'
);
// Handle orderbook updates
userWsClient.addHandler(USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK, (data) => {
   console.log('Orderbook update:', data);
   // Unsubscribe from the orderbook channel on first message
   userWsClient.unsubscribeSymbol(USER_WS_CLIENT_SYMBOL_CHANNELS.ORDER_BOOK, 'ETH');
});

// Example: Subscribe to trade updates
userWsClient.subscribeSymbol(
   USER_WS_CLIENT_SYMBOL_CHANNELS.TRADE,
   'ETH'
);
userWsClient.addHandler(USER_WS_CLIENT_SYMBOL_CHANNELS.TRADE, (data) => {
   console.log('Trade update:', data);
});

// Example: Subscribe to balance updates
userWsClient.subscribeAddress(
   USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE
);
// You can also use the .on method as an alias for .addHandler
userWsClient.on(USER_WS_CLIENT_ADDRESS_CHANNELS.BALANCE, (data) => {
   console.log('Balance update:', data);
});

// Example: Subscribe to position updates
userWsClient.subscribeAddress(
   USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION,
   '0x0000000000000000000000000000000000000000'
);
userWsClient.on(USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION, (data) => {
   console.log('Position update:', data);
});

// You can also set the user account address and subscribe to position updates
userWsClient.setUserAccountAddress('0x0000000000000000000000000000000000000000');
userWsClient.subscribeAddress(
   USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION,
);
userWsClient.on(USER_WS_CLIENT_ADDRESS_CHANNELS.POSITION, (data) => {
   console.log('Position update:', data);
});

```
For more details, see the [WebSocket Client source](./src/litlayer-ws-client.ts) 

## Error Handling

The SDK may throw specific types of errors:
- `RequiredError`: When a required parameter is missing.
- `LitlayerHttpError`: For issues related to HTTP requests (e.g., network errors, non-2xx status codes). This error may include a `status` property.
- `LitlayerApiError`: When the API returns a non-successful response (e.g., `success: false`). This error may include `code` and `msg` properties from the API.

It's recommended to wrap SDK calls in `try...catch` blocks to handle these potential errors gracefully.

Example:
```typescript
import { LitlayerHttpError, LitlayerApiError } from "@stellaxyz/litlayer-sdk";

try {
  // const data = await litlayerHttpClient.someAction(...);
} catch (error) {
  if (error instanceof LitlayerHttpError) {
    console.error(`HTTP Error: ${error.status} - ${error.message}`);
  } else if (error instanceof LitlayerApiError) {
    console.error(`API Error: ${error.code} - ${error.message}`);
  } else {
    console.error(`An unexpected error occurred: ${error.message}`);
  }
}
```
*(Note: `LitlayerHttpError` and `LitlayerApiError` are suggested improvements. Ensure they are implemented and exported from the SDK.)*


#### Order Management
```ts
import { OrderDirection, OrderType } from "@stellaxyz/litlayer-sdk";

// Place a limit order
const limitOrderResponse = await litlayerHttpClient.order.createLimit(
  OrderDirection.LONG,
  Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
  10, // leverage
  "2850", // price
  "0.5", // quantity
  "ETH", // symbol
);

// Place a market order
const marketOrderResponse = await litlayerHttpClient.order.createMarket(
  OrderDirection.SHORT,
  Math.floor(Date.now() / 1000) + 3600,
  5, // leverage
  "2850", // price
  "1.0", // quantity
  "0.1", // slippage
  "ETH",
);

// Query open orders
const openOrders = await litlayerHttpClient.order.queryOpenOrders(
  undefined, // address (optional)
  0, // subAccount (optional)
  1, // page
  10 // pageSize
);

// Cancel an order
await litlayerHttpClient.order.cancel("order-123", undefined);
```

#### Position Management
```ts
// Query open positions
const openPositions = await litlayerHttpClient.position.queryOpenPositions();

// Close a position
if (openPositions.data.length > 0) {
  const position = openPositions.data[0];
  await litlayerHttpClient.position.close(
    position.quantity, // close entire position
    position.position_no
  );
}

// Set Take Profit / Stop Loss
await litlayerHttpClient.order.closeTPSL(
  "position-123",
  "2800", // Stop Loss price
  "3000"  // Take Profit price
);
```

#### User Operations
```ts
// Query user balances
const balances = await litlayerHttpClient.user.queryBalances();

// Query trading performance
const performance = await litlayerHttpClient.user.queryPerformances();

// Transfer funds between sub-accounts
await litlayerHttpClient.user.transferFund(
  "1000", // amount
  2, // destination sub-account ID
  1  // source sub-account ID
);
```

## Market Making 

If you're interested in performing market making and get access to our extra websocket functionalities, contact aproov [a t] stellaxyz.io

## License

This SDK is licensed under the ISC License. See the [LICENSE](./LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on our [GitHub repository](https://github.com/Audax-Operations/ts-sdk/issues).
