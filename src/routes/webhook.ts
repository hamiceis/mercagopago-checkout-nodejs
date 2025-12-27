import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { webhookSchema } from "@/schemas";
import { PaymentStatus } from "@/types";
import { mercadoPagoPayment } from "@/infrastructure/mercadopago";
import { AppError, ERROR_CODES } from "@/shared/errors";
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

      if (type === "payment") {
        const paymentId = data.id;

        logger.info("Processing payment", { paymentId });

        try {
          const paymentInfo = await mercadoPagoPayment.get({ id: paymentId });
          // TODO: informações do pagamento recebido
          logger.debug("Payment info retrieved", {
            id: paymentInfo.id,
            status: paymentInfo.status,
            amount: paymentInfo.transaction_amount,
            method: paymentInfo.payment_method_id,
          });

          const status = paymentInfo.status as PaymentStatus;

          switch (status) {
            case "approved":
              logger.info("Payment approved", {
                paymentId,
                amount: paymentInfo.transaction_amount,
              });
              return reply.status(200).send({
                message: "Pagamento aprovado com sucesso!",
                status: "approved",
                payment_id: paymentId,
                amount: paymentInfo.transaction_amount,
              });

            case "rejected":
              logger.warn("Payment rejected", {
                paymentId,
                reason: paymentInfo.status_detail,
              });
              return reply.status(400).send({
                message: "Pagamento rejeitado",
                status: "rejected",
                payment_id: paymentId,
                reason: paymentInfo.status_detail,
              });

            case "cancelled":
              logger.warn("Payment cancelled", { paymentId });
              return reply.status(400).send({
                message: "Pagamento cancelado",
                status: "cancelled",
                payment_id: paymentId,
              });

            default:
              logger.warn("Unknown payment status", { paymentId, status });
              return reply.status(200).send({
                message: "Status de pagamento não reconhecido",
                status: status,
                payment_id: paymentId,
              });
          }
        } catch (error: any) {
          logger.error("Webhook error", {
            error: error.message,
            paymentId,
          });

          if (error.message?.includes("not found")) {
            throw new AppError(
              "Pagamento não encontrado",
              404,
              ERROR_CODES.PAYMENT_NOT_FOUND
            );
          }

          throw error;
        }
      }

      return reply.status(400).send({
        message: "Tipo de webhook não suportado",
        type: type,
      });
    }
  );
};
