import { z } from "zod";
import { webhookSchema, paymentStatusSchema } from "@/schemas/webhook.schema";

// Types inferidos dos schemas de webhook
export type WebhookPayload = z.infer<typeof webhookSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Type de resposta de webhook
export interface WebhookResponse {
  payment_id: string;
  message: string;
  status: string;
  amount?: number;
  reason?: string;
}
