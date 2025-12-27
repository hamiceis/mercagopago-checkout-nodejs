import { z } from "zod";

// Schema de validação para criação de pagamento
export const createPaymentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().positive("Preço deve ser maior que zero"),
});

// Schema para criação de ordem de pagamento (com front-end)
export const createPaymentOrderSchema = z.object({
  type: z.enum(["online"]),
  external_reference: z.string().min(1, "Referência externa é obrigatória"),
  payer: z.object({
    email: z.string().email("Email inválido"),
  }),
  payments: z
    .array(
      z.object({
        amount: z.string(),
        payment_method_id: z.string(),
        token: z.string(),
        installments: z.number().int().positive().default(1),
      })
    )
    .min(1, "Pelo menos um método de pagamento é necessário"),
});
