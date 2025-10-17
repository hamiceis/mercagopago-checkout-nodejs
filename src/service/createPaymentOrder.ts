import { CreateOrderBody, CreatePaymentOrderSchema } from "utils/schemas";
import { order } from "../utils/mercadopago"
import { randomUUID } from "node:crypto"
export async function createOrder(data: CreatePaymentOrderSchema) {
  const body: CreateOrderBody = {
    type: "online",
    external_reference: data.external_reference,
    payer: {
      email: data.payer.email,
    },
    transactions: {
      payments: data.payments.map((p) => ({
        amount: p.amount,
        payment_method: {
          id: p.payment_method_id,
          type: "credit_card",
          token: p.token,
        },
        installments: p.installments,
      })),
    },
  };

  const response = await order.create({
    body: body,
    requestOptions: {
      idempotencyKey: randomUUID(),
    }
  })

  return response
}
