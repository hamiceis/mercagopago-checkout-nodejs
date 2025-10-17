import { FastifyInstance } from "fastify"
import { CreatePaymentOrderSchema, CreatePaymentSchema } from "../utils/schemas"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { createPayment } from "../service/createPayment"
import { createOrder } from "service/createPaymentOrder"


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
    
    const data = request.body

    if(!data) {
      return reply.status(400).send({ message: "Dados invalidos" });
    }

    const order = await createOrder(data) 

    return order
  })
}