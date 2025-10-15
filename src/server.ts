import Fastify from "fastify"
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod"
import cors from "@fastify/cors"

import { env } from "../env"

import { createPaymentRoute } from "./routes/create-payment"
import { webhookRoute } from "./routes/webhook"
import { errorHandler } from "./errors/error-handler"


const app = Fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// 🚨 ERROR: Registrar error handler global
app.setErrorHandler(errorHandler)

app.get("/", (req, reply) => {
  return reply.status(200).send({ message: "Hello World" })
})

app.register(createPaymentRoute)
app.register(webhookRoute)


app.register(cors, {
  origin: "*",
})

app.listen({
  port: env.PORT || 3333, 
  host: "0.0.0.0",
}).then(() => {
  console.log("Server is running on port 3333 🚀")
})