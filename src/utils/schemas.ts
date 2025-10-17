import { z } from "zod"

//Requisição para criação de pagamento
export const CreatePaymentSchema = z.object({
  title: z.string(),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().positive(),
  // 💳 PIX: Removido payment_method - cliente escolhe no Mercado Pago entre PIX e cartão
})

//Caso tiver um front-end e precisa pegar esses dados do formulário
export const CreatePaymentOrderSchema = z.object({
  type: z.enum(['online']),
  external_reference: z.string().min(1),
  payer: z.object({
    email: z.string()
  }),
  payments: z.array(
    z.object({
      amount: z.string(),
      payment_method_id: z.string(),
      token: z.string(),
      installments: z.number().int().positive().default(1)
    }),
  )
})



//Schema para webhook do Mercado Pago
export const WebhookSchema = z.object({
  type: z.literal("payment"),
  data: z.object({
    id: z.string()
  })
})

//Status possíveis do pagamento
export const PaymentStatusSchema = z.enum(["approved", "rejected", "cancelled"])

//Tipos inferidos
export type CreatePaymentSchema = z.infer<typeof CreatePaymentSchema>
export type WebhookSchema = z.infer<typeof WebhookSchema>
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>
export type CreatePaymentOrderSchema = z.infer<typeof CreatePaymentOrderSchema>