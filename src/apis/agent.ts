import { CheckAgentPayloadSchema, ExchangeAgentPayloadSchema } from './schemas/agent';
import { CHAINS, GenericAPIResponse, PLATFORMS } from '../types';

/**
 * Helper function to send POST requests and get JSON response.
 *
 * @param {string} url - The URL to send the POST request to.
 * @param {any} payload - The payload to send in the request body.
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 */
async function postRequest<T>(url: string, payload: any): Promise<T> {
   const res = await fetch(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
   }).then((res) => res.json());
   return res;
}

/**
 * Checks if an agent exists on the specified chain and platform.
 *
 * @param {string} baseUrl - The base URL for the API.
 * @param {CHAINS} chainId - The chain ID to check the agent on.
 * @param {PLATFORMS} platform - The platform to check the agent on.
 * @param {string} address - The address of the agent to check.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the agent exists.
 */
export async function checkAgent(
   baseUrl: string,
   chainId: CHAINS,
   platform: PLATFORMS,
   address: string,
): Promise<boolean> {
   const payloadToValidate = {
      chain_id: chainId,
      platform: platform,
      proxy_address: address,
   };
   const validatedPayload = CheckAgentPayloadSchema.parse(payloadToValidate);

   const urlPath = `${baseUrl}/v1/check-agent`;
   const res = await postRequest<GenericAPIResponse<any>>(urlPath, validatedPayload);
   return res.success;
}

/**
 * Delegates an agent to perform actions on behalf of the mainAccount.
 * Works only for the specified platform and chain.
 *
 * @param {string} baseUrl - The base URL for the API.
 * @param {PLATFORMS} platform - The platform to exchange the agent on.
 * @param {CHAINS} chainId - The chain ID to exchange the agent on.
 * @param {string} agentAddress - The address of the agent to exchange.
 * @param {string} signature - The signature for the exchange.
 * @param {number} expiryTime - The expiry time for the exchange.
 * @param {string} mainAccountAddress - The address of the signer.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the exchange was successful.
 */
export async function exchangeAgent(
   baseUrl: string,
   platform: PLATFORMS,
   chainId: CHAINS,
   agentAddress: string,
   signature: string,
   expiryTime: number,
   mainAccountAddress: string,
): Promise<boolean> {
   const payloadToValidate = {
      chain_id: chainId,
      platform: platform,
      proxy_address: agentAddress,
      signature,
      expiry_time: expiryTime,
      account_address: mainAccountAddress,
   };
   const validatedPayload = ExchangeAgentPayloadSchema.parse(payloadToValidate);

   const urlPath = `${baseUrl}/v1/exchange`;
   const res = await postRequest<GenericAPIResponse<any>>(urlPath, validatedPayload);
   return res.success;
}
