import { FastifyInstance } from "fastify";
import {
  CreatePaymentOrderSchema,
  CreatePaymentSchema,
} from "../utils/schemas";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createPayment } from "../service/createPayment";
import { createOrder } from "service/createPaymentOrder";
import { AppError } from "@/shared/errors";
import { logger } from "@/shared/logger";

export async function createPaymentRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/payments/preferences",
    {
      schema: {
        body: CreatePaymentSchema,
      },
    },
    async (request, reply) => {
      const { title, quantity, unit_price } = request.body;

      logger.info("Creating payment", { title, quantity, unit_price });

      const payment = await createPayment({
        title,
        quantity,
        price: unit_price,
      });

      return reply.status(201).send(payment);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/payments/order",
    {
      schema: {
        body: CreatePaymentOrderSchema,
      },
    },
    async (request, reply) => {
      try {
        const data = request.body;

        logger.info("Creating payment order", {
          external_reference: data.external_reference,
          payer_email: data.payer.email,
          total_amount: data.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
          ),
        });

        const order = await createOrder(data);

        logger.info("Order created successfully", {
          orderId: order.id,
          status: order.status,
        });

        return reply.status(201).send({
          id: order.id,
          status: order.status,
          created_at: new Date().toISOString(),
          external_reference: data.external_reference,
          message: "Ordem de pagamento criada com sucesso",
        });
      } catch (error) {
        logger.error("Error creating order", { error });

        if (error instanceof AppError) {
          return reply
            .status(error.statusCode)
            .send({ message: error.message });
        }

        return reply.status(500).send({
          message: "Erro ao processar pagamento. Tente novamente mais tarde.",
        });
      }
    }
  );
}
