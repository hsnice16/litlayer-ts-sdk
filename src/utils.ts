import { checkAgent, exchangeAgent } from './apis/agent';
import { keccak256, toBytes, Account as ViemAccount } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { WalletClient } from 'viem';

import {
   AGENT_EXPIRE_DURATION,
   TYPED_SIG_DOMAIN_NAME,
   TYPED_SIG_DOMAIN_VERSION,
   TYPES_AGENT,
} from './constants';

import {
   CHAINS,
   PLATFORMS,
   ReadonlyHeaders,
   AuthenticatedHeaders,
   GenericObject,
   ENVIRONMENT,
} from './types';
import { LitlayerTypedDataDomain } from './types';
import { InvalidParameterError } from './error';

export {
   removeLeadingSlashes,
   verifyRequiredParameter,
   validateRequiredParameter,
   verifyStringRequiredParameter,
   validateStringRequiredParameter,
   getHttpErrorMsg,
   getAPIErrorMsg,
   getReadonlyHeaders,
   getHeaders,
   signTypedData,
   getExpiryTime,
   getSignTypedDomain,
   generateAgentAccount,
};

/**
 *
 * @summary Remove Leading Slashes
 * @param {string} value Value
 * @returns {string} Slashed String
 */
function removeLeadingSlashes(value: string): string {
   return value.replace(/\/+$/, '');
}

/**
 *
 * @summary Verify Required Parameter
 * @param {any} parameter Parameter
 * @returns {boolean} True/False
 */
function verifyRequiredParameter(parameter: any): boolean {
   return parameter !== null && parameter !== undefined;
}

/**
 *
 * @summary Verify String Required Parameter
 * @param {string} parameter Parameter
 * @returns {boolean} True/False
 */
function verifyStringRequiredParameter(parameter?: string): boolean {
   return verifyRequiredParameter(parameter) && parameter !== '';
}

/**
 *
 * @summary Validate Required Parameter, throws RequiredError if missing
 * @param {any} value Parameter value
 * @param {string} fieldName Parameter field name for error message
 * @throws {InvalidParameterError} If parameter is null or undefined
 */
function validateRequiredParameter(value: any, fieldName: string): void {
   if (!verifyRequiredParameter(value)) {
      throw new InvalidParameterError(
         fieldName,
         `Required parameter ${fieldName} was null or undefined.`,
      );
   }
}

/**
 *
 * @summary Validate String Required Parameter, throws RequiredError if missing or empty
 * @param {string} value Parameter value
 * @param {string} fieldName Parameter field name for error message
 * @throws {InvalidParameterError} If parameter is null, undefined, or empty string
 */
function validateStringRequiredParameter(value: string | undefined, fieldName: string): void {
   if (!verifyStringRequiredParameter(value)) {
      throw new InvalidParameterError(
         fieldName,
         `Required parameter ${fieldName} was null, undefined, or empty.`,
      );
   }
}

/**
 *
 * @summary Get HTTP Error Message
 * @param {number} status HTTP Status
 * @returns {string} Message
 */
function getHttpErrorMsg(status: number): string {
   return `Fetch Error. Status: ${status}`;
}

/**
 *
 * @summary Get API Error Message
 * @param {number} code Error Code
 * @param {string} msg Error Message
 * @returns {string} Message
 */
function getAPIErrorMsg(code: number, msg: string): string {
   return `Server Exception. Code ${code}: ${msg}`;
}

/**
 *
 * @summary Get Readonly Headers
 * @param {PLATFORMS} platform Platform
 * @param {CHAINS} chainId Chain ID
 * @returns {ReadonlyHeaders} Object
 */
function getReadonlyHeaders(platform: PLATFORMS, chainId: CHAINS): ReadonlyHeaders {
   return {
      'X-Platform': String(platform),
      'X-Chain-EVM-Id': String(chainId),
   } as any;
}

/**
 *
 * @summary Get Headers
 * @param {string} baseUrl Base URL
 * @param {PLATFORMS} platform Platform
 * @param {CHAINS} chainId Chain ID
 * @param {ViemAccount} agent Viem Account for the agent
 * @param {WalletClient} userWalletClient User's main Viem Wallet Client
 * @param {GenericObject<any>} payload Payload to sign
 * @param {ENVIRONMENT} [environment] Environment, Optional
 * @returns {AuthenticatedHeaders} Promise
 */
async function getHeaders(
   baseUrl: string,
   platform: PLATFORMS,
   chainId: CHAINS,
   agent: WalletClient,
   userWalletClient: WalletClient,
   payload: GenericObject<any>,
   environment: ENVIRONMENT,
): Promise<AuthenticatedHeaders> {
   const payloadString = JSON.stringify(payload);

   if (!userWalletClient.account) {
      throw new Error(
         'userWalletClient does not have an account for InternalHttpClient instantiation.',
      );
   }
   if (!agent.account) {
      throw new Error(
         'Agent WalletClient does not have an account for InternalHttpClient instantiation.',
      );
   }

   const isAgentAddressValid = await checkAgent(baseUrl, chainId, platform, agent.account.address);

   if (!isAgentAddressValid) {
      const expiryTime = getExpiryTime();

      if (!userWalletClient.account) {
         throw new Error(
            'userWalletClient does not have an account to sign with for agent exchange.',
         );
      }

      const signatureForAgentExchange = await signTypedData(
         platform,
         chainId,
         agent.account.address,
         userWalletClient,
         expiryTime,
         environment,
      );

      await exchangeAgent(
         baseUrl,
         platform,
         chainId,
         agent.account.address,
         signatureForAgentExchange,
         expiryTime,
         userWalletClient.account.address,
      );
   }

   const timestamp = Date.now();
   const signature = await agent!.signMessage({
      account: agent.account!,
      message: `${payloadString}${timestamp}`,
   });

   const stringifiedReadonlyHeaders = getReadonlyHeaders(platform, chainId);

   return {
      ...stringifiedReadonlyHeaders,
      'X-Nonce': timestamp,
      'X-Signature': signature,
   } as const;
}

/**
 *
 * @summary Sign Typed Data (for agent exchange, using user's WalletClient)
 * @param {PLATFORMS} platform Platform
 * @param {CHAINS} chainId Chain ID
 * @param {string} agentAddress Address of the agent being authorized
 * @param {WalletClient} singerWalletClient User's Viem Wallet Client to perform the signature
 * @param {number} expiryTime Expiry Time
 * @param {ENVIRONMENT} [environment] Environment, Optional
 * @returns {string} Signature Promise
 */
async function signTypedData(
   platform: PLATFORMS,
   chainId: CHAINS,
   agentAddress: string,
   singerWalletClient: WalletClient,
   expiryTime: number,
   environment: ENVIRONMENT,
): Promise<string> {
   const message = {
      litLayer: environment,
      agentAddress: agentAddress,
      platform: platform,
      expiryTime: expiryTime,
   };

   const domainInfo = getSignTypedDomain(chainId);
   const viemDomain = {
      name: domainInfo.name === null ? undefined : domainInfo.name,
      version: domainInfo.version === null ? undefined : domainInfo.version,
      chainId:
         typeof domainInfo.chainId === 'string'
            ? parseInt(domainInfo.chainId, 10)
            : domainInfo.chainId === null
              ? undefined
              : domainInfo.chainId,
   };

   if (!singerWalletClient.account) {
      throw new Error('userWalletClient does not have an account to sign with.');
   }

   return await singerWalletClient.signTypedData({
      account: singerWalletClient.account,
      domain: viemDomain,
      types: TYPES_AGENT,
      primaryType: 'Agent',
      message,
   });
}

/**
 *
 * @summary Get Expiry Time
 * @returns {number} Expiry Time
 */
function getExpiryTime(): number {
   return Math.floor(Date.now() / 1000) + AGENT_EXPIRE_DURATION;
}

/**
 *
 * @summary Get Sign Typed Domain
 * @param {CHAINS} chainId Chain ID
 * @returns {LitlayerTypedDataDomain} Object
 */
function getSignTypedDomain(chainId: CHAINS): LitlayerTypedDataDomain {
   let processedChainId: number | string | null = chainId;
   if (typeof chainId === 'string') {
      const parsed = parseInt(chainId, 10);
      processedChainId = isNaN(parsed) ? chainId : parsed;
   }
   return {
      name: TYPED_SIG_DOMAIN_NAME,
      version: TYPED_SIG_DOMAIN_VERSION,
      chainId: processedChainId,
   };
}

/**
 *
 * @summary Generate Agent Account (returns a ViemAccount)
 * @returns {ViemAccount} Promise or direct ViemAccount
 */
function generateAgentAccount(): ViemAccount {
   const randomPrivateKey = generatePrivateKey();
   const privateKey = keccak256(toBytes(randomPrivateKey));
   return privateKeyToAccount(privateKey as `0x${string}`);
}
