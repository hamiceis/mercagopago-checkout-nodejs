import { z } from "zod";
import {
  createPaymentSchema,
  createPaymentOrderSchema,
} from "@/schemas/payment.schema";

// Types inferidos dos schemas de payment
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type CreatePaymentOrderRequest = z.infer<typeof createPaymentOrderSchema>;

// Type de resposta de criação de pagamento
export interface CreatePaymentResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  available_methods: string;
}

// Type de resposta de criação de ordem
export interface CreateOrderResponse {
  id: string;
  status: string;
  created_at: string;
  external_reference: string;
  message: string;
}
