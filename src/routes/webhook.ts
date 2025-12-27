import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { webhookSchema } from "@/schemas";
import { WebhookService } from "@/domain/webhook";
import { logger } from "@/shared/logger";

export const webhookRoute = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/webhook",
    {
      schema: {
        body: webhookSchema,
      },
    },
    async (request, reply) => {
      const { type, data } = request.body;

      logger.info("Webhook received", { type, paymentId: data.id });

      // Validar tipo de webhook usando domain service
      if (!WebhookService.validateWebhookType(type)) {
        return reply.status(400).send({
          message: "Tipo de webhook não suportado",
          type: type,
        });
      }

      const paymentId = data.id;

      // Processar pagamento usando domain service
      const result = await WebhookService.processPayment(paymentId);

      return reply.status(200).send(result);
    }
  );
};
