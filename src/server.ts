import Fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import cors from "@fastify/cors";

import { env, corsConfig, HTTP_MESSAGES } from "@/config";
import { errorHandler } from "@/shared/errors";
import { logger } from "@/shared/logger";

import { createPaymentRoute } from "./routes/create-payment";
import { webhookRoute } from "./routes/webhook";
import { statusRoutes } from "./routes/status-routes";

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 🚨 ERROR: Registrar o Error handler global
app.setErrorHandler(errorHandler);

app.register(cors, corsConfig);

app.get("/", (req, reply) => {
  return reply.status(200).send({ message: HTTP_MESSAGES.HELLO_WORLD });
});

app.register(createPaymentRoute);
app.register(webhookRoute);
app.register(statusRoutes);

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    logger.info("Server started", { port: env.PORT });
  });
