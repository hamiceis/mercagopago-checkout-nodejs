import { z } from "zod";

// Schema de validação para criação de pagamento
export const createPaymentSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .trim()
    .regex(
      /^[a-zA-Z0-9\s\-.,!?áéíóúãõâêôàèìòùäëïöüÁÉÍÓÚÃÕÂÊÔÀÈÌÒÙÄËÏÖÜ]+$/,
      "Título contém caracteres não permitidos"
    ),

  quantity: z
    .number()
    .int("Quantidade deve ser número inteiro")
    .positive("Quantidade deve ser maior que zero")
    .max(999, "Quantidade máxima: 999 unidades")
    .default(1),

  unit_price: z
    .number()
    .positive("Preço deve ser maior que zero")
    .min(0.01, "Preço mínimo: R$ 0,01")
    .max(999999.99, "Preço máximo: R$ 999.999,99")
    .multipleOf(0.01, "Preço deve ter no máximo 2 casas decimais"),
});

// Schema para criação de ordem de pagamento (com front-end)
export const createPaymentOrderSchema = z.object({
  type: z.enum(["online"]),

  external_reference: z
    .string()
    .min(1, "Referência externa é obrigatória")
    .max(200, "Referência externa muito longa")
    .trim(),

  payer: z.object({
    email: z
      .string()
      .email("Email inválido")
      .toLowerCase()
      .trim()
      .max(255, "Email muito longo"),
  }),

  payments: z
    .array(
      z.object({
        amount: z
          .string()
          .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            "Valor deve ser um número positivo"
          )
          .refine(
            (val) => Number(val) <= 999999.99,
            "Valor máximo: R$ 999.999,99"
          ),

        payment_method_id: z
          .string()
          .min(1, "Método de pagamento é obrigatório")
          .max(50, "Método de pagamento inválido"),

        token: z
          .string()
          .min(10, "Token de pagamento inválido")
          .max(500, "Token muito grande"),

        installments: z
          .number()
          .int("Parcelas deve ser número inteiro")
          .positive("Parcelas deve ser maior que zero")
          .max(12, "Máximo de 12 parcelas")
          .default(1),
      })
    )
    .min(1, "Pelo menos um método de pagamento é necessário")
    .max(5, "Máximo de 5 métodos de pagamento por ordem"),
});
