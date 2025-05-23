import { z } from "zod/v4";
import { OrderDirection, OrderType } from "../../types";

export const CreateOrderSchema = z.object({
  direction: z.enum(OrderDirection),
  expiry_time: z
    .number()
    .positive({ message: "expiryTime must be a positive number" })
    .transform((val: number) => (val < 10000000000 ? val * 1000 : val))
    .refine((val: number) => val > Date.now(), {
      message: "expiryTime must be greater than current timestamp",
    }),
  leverage: z
    .number()
    .positive({ message: "leverage must be a positive number" }),
  price: z.string().min(0, { message: "price cannot be empty" }),
  quantity: z.string().min(0, { message: "quantity cannot be empty" }),
  slippage: z.string().min(1, { message: "slippage cannot be empty" }),
  symbol: z.string().min(1, { message: "symbol cannot be empty" }),
  type: z.enum(OrderType),
  client_order_id: z.string().optional(),
});

export const CancelOrderSchema = z
  .object({
    order_no: z.string().optional(),
    client_order_id: z.string().optional(),
  })
  .refine(
    (data: { order_no?: string; client_order_id?: string }) =>
      data.order_no || data.client_order_id,
    "Either order_no or client_order_id must be provided"
  );

export const CancelOrdersSchema = z
  .object({
    order_nos: z.array(z.string().min(1)).optional(),
    client_order_ids: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (data: { order_nos?: string[]; client_order_ids?: string[] }) =>
      (data.order_nos && data.order_nos.length > 0) ||
      (data.client_order_ids && data.client_order_ids.length > 0),
    "Either order_nos or client_order_ids must be provided and non-empty"
  );

export const CloseOrderSchema = z.object({
  close_quantity: z
    .string()
    .min(1, { message: "close_quantity cannot be empty" }),
  position_no: z.string().min(1, { message: "position_no cannot be empty" }),
  price: z.string().min(1, { message: "price cannot be empty" }),
});

export const CloseTPSLOrderSchema = z.object({
  position_no: z.string().min(1, { message: "position_no cannot be empty" }),
  sl_price: z.string().optional(),
  tp_price: z.string().optional(),
});
