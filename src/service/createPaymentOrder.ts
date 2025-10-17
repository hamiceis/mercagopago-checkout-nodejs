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


//Front-end envia uma requisição POST /orders com corpo como: 

// {
//   "type": "online",
//   "external_reference": "pedido-123",
//   "payer": {
//     "email": "cliente@exemplo.com"
//   },
//   "payments": [
//     {
//       "amount": 50.0,
//       "payment_method_id": "visa",
//       "token": "TOKEN_DO_CARTAO",
//       "installments": 1
//     }
//   ]
// }
