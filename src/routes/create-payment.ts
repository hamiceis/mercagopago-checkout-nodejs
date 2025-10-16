import { FastifyInstance } from "fastify"
import { CreatePaymentSchema } from "../utils/schemas"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { createPayment } from "../service/createPayment"


export async function createPaymentRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/payments/preferences", {
    schema: {
      body: CreatePaymentSchema
    }
  }, async (request, reply) => {
    
    const { title, quantity, unit_price } = request.body
    
    // 🐛 DEBUG: Log da criação de pagamento
    console.log("🛒 Criando pagamento:", { title, quantity, unit_price, available_methods: "PIX e Cartão de Crédito" })
    
   const payment = await createPayment({
    title, 
    quantity,
    price: unit_price
    // 💳 PIX: Cliente escolhe método no Mercado Pago
   })

    return reply.status(201).send(payment)
  })

  app.withTypeProvider<ZodTypeProvider>().post("/payment/order", {}, (req, res) => {
    
  })
}