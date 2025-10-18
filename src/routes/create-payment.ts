import { FastifyInstance } from "fastify"
import { CreatePaymentOrderSchema, CreatePaymentSchema } from "../utils/schemas"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { createPayment } from "../service/createPayment"
import { createOrder } from "service/createPaymentOrder"
import { ClientError } from "errors/client-error"

export async function createPaymentRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/payments/preferences", {
    schema: {
      body: CreatePaymentSchema
    }
  }, async (request, reply) => {
    
    const { title, quantity, unit_price } = request.body
    
    // 🐛 DEBUG: Log da criação de pagamento
    console.log("🛒 Criando pagamento:", { title, quantity, unit_price })
    
   const payment = await createPayment({
    title, 
    quantity,
    price: unit_price
    // 💳 PIX: Cliente escolhe método no Mercado Pago
   })

    return reply.status(201).send(payment)
  })
 //rota quando se tem um front-end
  app.withTypeProvider<ZodTypeProvider>().post("/payments/order", {
    schema: {
      body: CreatePaymentOrderSchema
    }
  }, async (request, reply) => {
    try {
      const data = request.body
      
      // Log da criação de ordem de pagamento
      console.log("🛒 Criando ordem de pagamento:", { 
        external_reference: data.external_reference,
        payer_email: data.payer.email,
        payment_methods: data.payments.map(p => p.payment_method_id).join(', '),
        total_amount: data.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      })
      
      const order = await createOrder(data)
      
      // Log de sucesso
      console.log("✅ Ordem criada com sucesso:", { 
        id: order.id, 
        status: order.status,
        created_at: new Date().toISOString()
      })
      
      return reply.status(201).send({
        id: order.id,
        status: order.status,
        created_at: new Date().toISOString(),
        external_reference: data.external_reference,
        message: "Ordem de pagamento criada com sucesso"
      })
    } catch (error) {
      console.error("❌ Erro ao criar ordem:", error)
      
      if (error instanceof ClientError) {
        return reply.status(400).send({ message: error.message })
      }
      
      return reply.status(500).send({ 
        message: "Erro ao processar pagamento. Tente novamente mais tarde." 
      })
    }
  })
}