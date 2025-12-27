import Fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import cors from "@fastify/cors";

import { env, corsConfig, HTTP_MESSAGES } from "@/config";

import { createPaymentRoute } from "./routes/create-payment";
import { webhookRoute } from "./routes/webhook";
import { statusRoutes } from "./routes/status-routes";
import { errorHandler } from "./errors/error-handler";

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 🚨 ERROR: Registrar error handler global
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
    console.log("Server is running on port 3333 🚀");
  });
