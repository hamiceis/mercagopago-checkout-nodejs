import { FastifyInstance } from "fastify"
import { ClientError } from "./client-error"
import { ZodError } from "zod"
import dayjs from "dayjs"

// 🚨 ERROR: Tipo para o error handler do Fastify
type FastifyErrorHandler = FastifyInstance['errorHandler']

// 🚨 ERROR: Error handler global para todas as rotas
export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // 🐛 DEBUG: Log do erro para debug
  console.log("🚨 Erro capturado:", {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss") // 📅 DAYJS: Usar dayjs para timestamp formatado
  })

  // 🚨 ERROR: Erro de validação do Zod (dados inválidos)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Dados inválidos",
      errors: error.flatten().fieldErrors,
      statusCode: 400
    })
  }

  // 🚨 ERROR: Erro customizado do cliente (erro de negócio)
  if (error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message,
      statusCode: 400
    })
  }

  // 🚨 ERROR: Erro interno do servidor (erro não tratado)
  return reply.status(500).send({ 
    message: "Erro interno do servidor",
    statusCode: 500
  })
}
