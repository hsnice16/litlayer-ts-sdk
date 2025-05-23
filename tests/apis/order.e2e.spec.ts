import { privateKeyToAccount, Account } from "viem/accounts";
import { describe, expect, test, beforeAll } from "vitest";

import {
   CHAINS,
   ENVIRONMENT,
   generateAgentAccount,
   PLATFORMS,
   OrderDirection,
   OrderType,
} from "../../src";
import { FetchHttpClient } from "../../src/clients/fetch-http-client"
import { Order } from "../../src/apis/order"
import { Position } from "../../src/apis/position"

describe("Order API tests", () => {
   let client: FetchHttpClient;
   let orderApi: Order;
   let mainAccount: Account;
   let agentAccount: Account;
   let createdOrderIds: string[];

   beforeAll(async () => {
      const privateKey = (process.env.PRIV_KEY ?? "") as `0x${string}`;
      if (!privateKey) { throw new Error("PRIV_KEY is missing in env"); }
      const httpUrl = process.env.HTTP_URL ?? "";
      if (!httpUrl) { throw new Error("HTTP_URL is missing in env"); }
      mainAccount = privateKeyToAccount(privateKey);
      agentAccount = generateAgentAccount();
      client = new FetchHttpClient(
         httpUrl,
         ENVIRONMENT.TESTNET,
         PLATFORMS.STELLA,
         CHAINS.BERA_BEPOLIA,
         mainAccount,
         agentAccount
      );
      orderApi = new Order(client);
   });

   test(
      "order.queryOpenOrders should have list length greater than or equal to 0",
      async () => {
         const orders = await orderApi.queryOpenOrders();
         console.log(orders);
         expect(orders.total).toBeGreaterThanOrEqual(0);
         expect(orders.relation).toBe("eq")
      },
      60 * 1000
   );

   test("order.create should return the created order Id, order.cancel should return the canceled order Id", async () => {
      const expiryTime = Math.floor(Date.now() / 1000) + 15;
      const createdOrder = await orderApi.create(
         OrderDirection.LONG,
         expiryTime,
         20,
         "2100",
         "0.1",
         "0",
         "ETH",
         OrderType.LIMIT
      );
      expect(createdOrder.order_no).toContain("UL");

      const canceledOrder = await orderApi.cancel(createdOrder.order_no);
      expect(canceledOrder.order_no).toEqual(createdOrder.order_no);
   });

   test("order.create with invalid symbol should throw an error", async () => {
      const expiryTime = Math.floor(Date.now() / 1000) + 5;
      await expect(orderApi.create(
         OrderDirection.LONG,
         expiryTime,
         2,
         "2100",
         "1.524",
         "0",
         "INVALID_SYMBOL",
         OrderType.LIMIT
      )).rejects.toThrow();
   });

   test("order.creates should return the created order Ids, order.cancels should return the canceled order Ids", async () => {
      const createdOrders = await orderApi.creates([
         {
            direction: OrderDirection.LONG,
            expiry_time: Date.now() + 10 * 1000,
            leverage: 20,
            price: "2100",
            quantity: "0.1",
            slippage: "0",
            symbol: "ETH",
            type: OrderType.LIMIT,
         },
         {
            direction: OrderDirection.LONG,
            expiry_time: Date.now() + 10 * 1000,
            leverage: 20,
            price: "2070.6",
            quantity: "0.1",
            slippage: "10",
            symbol: "ETH",
            type: OrderType.MARKET,
         },
      ]);
      createdOrderIds = createdOrders.map(
         (createdOrder) => createdOrder.order_no
      );
      expect(createdOrderIds.length).toEqual(2);

      const result = await orderApi.cancels(createdOrderIds);
      const canceledOrderIds = result.map((order) => order.order_no);
      expect(canceledOrderIds).toEqual(createdOrderIds);
   });

   // test("order.closeTPSL should throw error `API Error Code: -1221 - tp/sl price is empty`", async () => {
   //    // This also relies on `openPositions`
   //    if (openPositions && openPositions.length > 0) {
   //       const position = openPositions[0];
   //       try {
   //          await orderApi.closeTPSL(position.position_no);
   //       } catch (err: any) {
   //          const expected = "API Error Code: -1221 - tp/sl price is empty";
   //          expect(err.message).toEqual(expected);
   //       }
   //    } else {
   //       console.log("(Order Spec) There's no open positions for order.closeTPSL based on `openPositions` var");
   //    }
   // });
}); 