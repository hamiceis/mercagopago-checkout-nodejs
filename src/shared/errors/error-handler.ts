import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error";
import { logger } from "@/shared/logger";
import { env } from "@/config/env";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  logger.error("Error captured", {
    error: error.message,
    url: request.url,
    method: request.method,
    ...(env.PORT !== 3333 ? {} : { stack: error.stack }), // Stack apenas em dev
  });

  // Zod validation error
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Dados inválidos",
      errors: error.flatten().fieldErrors,
    });
  }

  // App error (business logic)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      ...(error.metadata && { metadata: error.metadata }),
    });
  }

  // Internal server error
  return reply.status(500).send({
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
  });
};
