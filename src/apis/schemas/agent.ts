import { z } from 'zod/v4';
import { CHAINS, PLATFORMS } from '../../types';

export const CheckAgentPayloadSchema = z.object({
   chain_id: z.enum(CHAINS),
   platform: z.enum(PLATFORMS),
   proxy_address: z.string().min(32, 'proxy_address cannot be empty'),
});

export const ExchangeAgentPayloadSchema = z.object({
   chain_id: z.enum(CHAINS),
   platform: z.enum(PLATFORMS),
   proxy_address: z.string().min(1, 'proxy_address cannot be empty'),
   signature: z.string().min(1, 'signature cannot be empty'),
   expiry_time: z.number().positive('expiry_time must be a positive number'),
   account_address: z.string().min(1, 'account_address cannot be empty'),
});
