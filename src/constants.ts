export const AGENT_EXPIRE_DURATION = 1 * 86_400; // 1 day

export const TYPED_SIG_DOMAIN_NAME = 'LitLayer';
export const TYPED_SIG_DOMAIN_VERSION = 'v1';

export const TYPES_AGENT = {
   Agent: [
      {
         name: 'litLayer',
         type: 'string',
      },
      {
         name: 'agentAddress',
         type: 'address',
      },
      {
         name: 'platform',
         type: 'string',
      },
      {
         name: 'expiryTime',
         type: 'uint256',
      },
   ],
};
