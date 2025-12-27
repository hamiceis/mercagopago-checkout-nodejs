import { z } from "zod";

// Schema de validação para webhook do Mercado Pago
export const webhookSchema = z.object({
  type: z.literal("payment"),
  data: z.object({
    id: z.string(),
  }),
});

// Enum de status de pagamento
export const paymentStatusSchema = z.enum([
  "approved",
  "rejected",
  "cancelled",
  "pending",
]);
