import 'dotenv/config';
import { LitlayerHttpClient, CHAINS, PLATFORMS, ENVIRONMENT } from '@stellaxyz/litlayer-sdk';
import { privateKeyToAccount } from 'viem/accounts';

const signer = privateKeyToAccount(`0x${process.env.PRIVATE_KEY ?? ''}`);

async function main() {
   //  Testnet Environment
   const litlayerHttpClient = await LitlayerHttpClient.create(
      CHAINS.BERA_BEPOLIA,
      PLATFORMS.STELLA,
      ENVIRONMENT.TESTNET,
      signer,
      'https://testnet.v2.stellaxyz.io',
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
   console.log('Sub Accounts:', subAccounts);

   // Example: Fetching oracle price
   const oraclePrice = await litlayerHttpClient.oracle.getPrice('ETH');
   console.log('Oracle Price for ETH:', oraclePrice);

   // Example: Check API health
   const isHealthy = await litlayerHttpClient.checkHealth();
   console.log('API Health:', isHealthy ? 'Healthy' : 'Unhealthy');

   // Example: Query open orders
   const openOrders = await litlayerHttpClient.order.queryOpenOrders(
      signer.address, // address (optional)
      0, // subAccount (optional)
      1, // page (optional)
      10, // pageSize (optional)
   );
   console.log('Open Orders:', openOrders);

   // Example: Query open positions
   const openPositions = await litlayerHttpClient.position.queryOpenPositions();
   console.log('Open Positions:', openPositions);
}

main().catch(console.error);
