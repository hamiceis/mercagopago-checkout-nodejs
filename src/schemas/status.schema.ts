import { z } from "zod";

// Schema para query parameters de status
export const StatusQuerySchema = z.object({
  payment_id: z.string().optional(),
  status: z.string().optional(),
  external_reference: z.string().optional(),
  merchant_order_id: z.string().optional(),
});

// Schema para resposta de status
export const StatusResponseSchema = {
  200: z.object({
    message: z.string(),
    payment_id: z.string().optional(),
    status: z.string().optional(),
    external_reference: z.string().optional(),
    merchant_order_id: z.string().optional(),
    timestamp: z.string(),
  }),
};
