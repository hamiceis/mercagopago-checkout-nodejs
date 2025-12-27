import { PaymentPreference } from "@/types";
import { CreatePaymentResponse } from "@/types/api/payment.types";
import crypto from "node:crypto";

// Converte dados de domínio para o formato da API do MercadoPago
export const toPreferenceRequest = (
  data: PaymentPreference,
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  }
) => {
  return {
    items: [
      {
        id: crypto.randomUUID(),
        title: data.title,
        quantity: data.quantity,
        unit_price: data.price,
        currency_id: "BRL",
      },
    ],
    back_urls: backUrls,
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [{ id: "ticket" }],
    },
  };
};

// Converte resposta da API para o formato usado no domínio
export const toPreferenceResponse = (response: any): CreatePaymentResponse => {
  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    available_methods: "PIX e Cartão de Crédito",
  };
};


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
