import { preference } from "utils/mercadopago";
import crypto from "node:crypto";
import { env } from "@/config/env";
import { logger } from "@/shared/logger";
import { PaymentPreference } from "@/types";

export async function createPayment({
  title,
  price,
  quantity,
}: PaymentPreference) {
  logger.info("Creating payment preference", { title, quantity, price });

  const response = await preference.create({
    body: {
      items: [
        {
          id: crypto.randomUUID(),
          title,
          quantity,
          unit_price: price,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${env.LOCALHOST}/success`,
        failure: `${env.LOCALHOST}/failure`,
        pending: `${env.LOCALHOST}/pending`,
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [
          { id: "ticket" }, // Excluir apenas boleto
        ],
      },
    },
  });

  logger.info("Payment preference created", { preferenceId: response.id });

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    available_methods: "PIX e Cartão de Crédito",
  };
}

/*
 * ===== EXEMPLOS DE USO (Fins Didáticos) =====
 * 2. MÉTODOS DE PAGAMENTO (payment_methods):
 *
 * - excluded_payment_types: Array de tipos de pagamento a EXCLUIR
 *   Tipos disponíveis:
 *   • "credit_card"  - Cartão de crédito
 *   • "debit_card"   - Cartão de débito
 *   • "ticket"       - Boleto bancário
 *   • "bank_transfer"- Transferência bancária
 *   • "atm"          - Caixa eletrônico
 *
 * - excluded_payment_methods: Array de métodos específicos a EXCLUIR
 *   Exemplos:
 *   • { id: "visa" }           - Excluir Visa
 *   • { id: "master" }         - Excluir Mastercard
 *   • { id: "amex" }           - Excluir American Express
 *   • { id: "pix" }            - Excluir PIX
 *
 * - installments: Número máximo de parcelas (1 a 12)
 *
 * 3. CONFIGURAÇÃO ATUAL:
 * Excluindo apenas: ["ticket"]
 * Permitindo: PIX, Cartão de Crédito, Cartão de Débito
 *
 * 4. OUTROS EXEMPLOS DE CONFIGURAÇÃO:
 *
 * // Apenas PIX:
 * payment_methods: {
 *   excluded_payment_types: [
 *     { id: "credit_card" },
 *     { id: "debit_card" },
 *     { id: "ticket" }
 *   ]
 * }
 *
 */
