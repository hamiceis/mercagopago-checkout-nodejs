import { CreatePaymentOrderRequest } from "@/types";
import { randomUUID } from "node:crypto";

//Front-end
// Converte dados de domínio para request de pagamento do MercadoPago
export const toPaymentRequest = (
  data: CreatePaymentOrderRequest,
  paymentItem: any
) => {
  return {
    transaction_amount: Number(paymentItem.amount),
    token: paymentItem.token,
    description: `Pagamento ref: ${data.external_reference}`,
    installments: paymentItem.installments,
    payment_method_id: paymentItem.payment_method_id,
    payer: {
      email: data.payer.email,
    },
    external_reference: data.external_reference,
  };
};

// Gera chave única para evitar duplicação de pagamentos
export const generateIdempotencyKey = (): string => {
  return randomUUID();
};
