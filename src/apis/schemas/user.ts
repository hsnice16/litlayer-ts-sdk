import { z } from 'zod/v4';

export const CreateAccountSchema = z.object({
   name: z.string().min(1, 'name cannot be empty'),
});

export const DeleteAccountSchema = z.object({
   sub_account_id: z.number({ message: 'sub_account_id is required' }),
});

export const SwitchAccountSchema = z.object({
   sub_account_id: z.number({ message: 'sub_account_id is required' }),
});

export const TransferFundSchema = z.object({
   amount: z.string().min(1, 'amount cannot be empty'),
   sub_account_id: z.number({ message: 'sub_account_id is required' }),
   sub_account_id_from: z.number({ message: 'sub_account_id_from is required' }),
});

export const UpdateAccountSchema = z.object({
   acc_avatar: z.string().min(1, 'avatar cannot be empty'),
   acc_name: z.string().min(1, 'name cannot be empty'),
   sub_account_id: z.number({ message: 'sub_account_id is required' }),
});

export const UpdateProfileSchema = z.object({
   nickname: z.string().min(1, 'nickname cannot be empty'),
});

export const SubmitWithdrawSchema = z.object({
   withdraw_amount: z.number().positive('withdrawAmount must be a positive number'),
});
