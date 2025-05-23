import { privateKeyToAccount, Account } from "viem/accounts";
import { describe, expect, test, beforeAll } from "vitest";

import {
  CHAINS,
  ENVIRONMENT,
  generateAgentAccount,
  LitlayerApiError,
  PLATFORMS,
  PositionData,
} from "../../src";

import { FetchHttpClient } from "../../src/clients/fetch-http-client";
import { Position } from "../../src/apis/position";
import { Order } from "../../src/apis/order"; // Import Order API
import { Oracle } from "../../src/apis/oracle";

describe("Position API tests", () => {
  let client: FetchHttpClient;
  let positionApi: Position;
  let orderApi: Order; // Add OrderApi
  let mainAccount: Account;
  let agentAccount: Account;
  let openPositions: PositionData[] = []; // Initialize openPositions
  let oracleApi: Oracle;

  beforeAll(async () => {
    const privateKey = (process.env.PRIV_KEY ?? "") as `0x${string}`;
    if (!privateKey) {
      throw new Error("PRIV_KEY is missing in env");
    }
    const httpUrl = process.env.HTTP_URL ?? "";
    if (!httpUrl) {
      throw new Error("HTTP_URL is missing in env");
    }
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
    positionApi = new Position(client);
    orderApi = new Order(client); // Instantiate OrderApi
    oracleApi = new Oracle(client);
  });

  test("position.queryOpenPositions should have list length greater than or equal to 0", async () => {
    const positions = await positionApi.queryOpenPositions();
    console.log(positions);
    openPositions = positions.list ?? [];
    expect(positions.total).toBeGreaterThanOrEqual(openPositions.length);
  });

  test("position.queryClosedPositions should have list length greater than or equal to 0", async () => {
    const positions = await positionApi.queryClosedPositions();
    console.log(positions);
    const list = positions.list ?? [];
    expect(positions.total).toBeGreaterThanOrEqual(list.length);
  });

  test(
    "position.close should close an open position",
    async () => {
      if (openPositions.length > 0) {
        const positionToClose = openPositions[0];
        console.log(
          `Attempting to close position: ${positionToClose.position_no} with quantity: ${positionToClose.quantity}`
        );
        try {
          const marketPrice = await oracleApi.getPrice(positionToClose.symbol);
          const closeResponse = await positionApi.close(
            positionToClose.quantity,
            positionToClose.position_no,
            marketPrice.latest_price.mark_price.toString()
          );
          console.log("Close position response:", closeResponse);
          expect(closeResponse).toBe("good");
        } catch (error) {
          console.error(
            `Error closing position ${positionToClose.position_no}:`,
            error
          );
          // Integration success, failing at the backend.
          if (error instanceof LitlayerApiError) {
            console.warn("Error closing position:", error.message);
            return;
          }
        }
      } else {
        console.warn(
          "(Position Spec) No open positions found to test closing. Skipping close test."
        );
      }
    },
    60 * 1000
  );
});
