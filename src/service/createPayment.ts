import { preference } from "utils/mercadopago";
import crypto from "node:crypto"
import { env } from "../../env";

interface ICreatePayment {
  title: string,
  quantity: number,
  price: number
  // 💳 PIX: Removido payment_method - cliente escolhe no Mercado Pago
} 


export async function createPayment({ title, price, quantity }: ICreatePayment) {
  // 💳 PIX: Permitir apenas PIX e cartão de crédito (cliente escolhe no Mercado Pago)
  const paymentMethods = {
    excluded_payment_methods: [],
    excluded_payment_types: [
      { id: "debit_card" },    // Excluir cartão de débito
      { id: "ticket" },        // Excluir boleto
      { id: "bank_transfer" }, // Excluir transferência bancária
      { id: "digital_currency" } // Excluir moedas digitais
    ]
  }

  // 🐛 DEBUG: Log dos métodos de pagamento disponíveis
  console.log("💳 Métodos disponíveis: PIX e Cartão de Crédito")

  const response = await preference.create({
    body: {
      items: [
        {
          id: crypto.randomUUID(),
          title, 
          quantity,
          unit_price: price,
          currency_id: "BRL"
        },
      ],
      back_urls: {
        success: `${env.LOCALHOST}/success`,
        failure: `${env.LOCALHOST}/failure`,
        pending: `${env.LOCALHOST}/pending`,
      },
      auto_return: "approved",
      ...paymentMethods // 💳 PIX: Aplicar configuração de métodos de pagamento
    },
  })

  // 🐛 DEBUG: Log da resposta da preferência criada
  console.log("✅ Preferência criada:", { 
    id: response.id, 
    init_point: response.init_point,
    available_methods: "PIX e Cartão de Crédito"
  })

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    available_methods: "PIX e Cartão de Crédito" // 💳 PIX: Informar métodos disponíveis
  }
}