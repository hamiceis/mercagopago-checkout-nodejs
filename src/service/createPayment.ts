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
  

  // 🐛 DEBUG: Log da configuração de métodos de pagamento
  console.log("💳 Configuração de métodos de pagamento:")
  
 
  // 🐛 DEBUG: Log dos dados do item
  console.log("📦 Dados do item:", {
    title,
    quantity,
    unit_price: price
  })

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
      payment_methods: {
        // exemplo de permitir PIX e cartão debito (tente não sobrescrever campos padrão)
        excluded_payment_methods: [],
        excluded_payment_types: [
          { id: "credit_card" }, // excluir cartão de crédito
          { id: "ticket" },       // excluir tickets / boleto / etc.
        ],
        //podemos deixar pagamento padrão abaixo
        // default_payment_method_id: "pix",
      },
    },
  })

  // 🐛 DEBUG: Log da resposta da preferência criada
  console.log("✅ Preferência criada:", { 
    id: response.id, 
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    available_methods: "PIX e Cartão de Crédito"
  })
  
  // 🐛 DEBUG: Log completo da resposta para verificar configurações aplicadas
  // console.log("📋 Resposta completa do Mercado Pago:", 
  // JSON.stringify(response, null, 2))

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    available_methods: "PIX e Cartão de Crédito" // 💳 PIX: Informar métodos disponíveis
  }
}