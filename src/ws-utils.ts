import { WalletClient } from 'viem';
import { CHAINS, ENVIRONMENT, PLATFORMS } from './types';
import { getSignTypedDomain } from './utils';
import { WS_TYPES_AGENT } from './ws/constants';

export { pause, signWsTypedData };

/**
 *
 * @summary Pause the execution for X milliseconds
 * @param {number} duration Pause for duration
 * @returns {Promise} Promise
 */
function pause(duration: number) {
   return new Promise((resolve) => setTimeout(resolve, duration));
}

/**
 *
 * @summary Sign WebSocket Typed Data
 * @param {PLATFORMS} platform Platform
 * @param {CHAINS} chainId Chain ID
 * @param {MainAccountAdapter} signer Signer Adapter
 * @param {number} expiryTime Expiry Time
 * @param {ENVIRONMENT} [environment] Environment, Optional
 * @returns {string} Signature Promise
 */
async function signWsTypedData(
   platform: PLATFORMS,
   chainId: CHAINS,
   mmAccount: WalletClient,
   expiryTime: number,
   environment: ENVIRONMENT,
): Promise<string> {
   const message = {
      litLayer: environment,
      platform: platform,
      timestamp: expiryTime,
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

   if (!mmAccount.account) {
      throw new Error('userWalletClient does not have an account to sign with.');
   }

   return await mmAccount.signTypedData({
      account: mmAccount.account,
      domain: viemDomain,
      primaryType: 'Authentication',
      types: WS_TYPES_AGENT,
      message,
   });
}
