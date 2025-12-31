import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createPaymentSchema,
  createPaymentOrderSchema,
  getPaymentParamsSchema,
  getPaymentResponseSchema,
} from "@/schemas";
import { PaymentService } from "@/domain/payment";
import { logger } from "@/shared/logger";

export async function createPaymentRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/payments/preferences",
    {
      schema: {
        body: createPaymentSchema,
      },
    },
    async (request, reply) => {
      const { title, quantity, unit_price } = request.body;

      logger.info("Creating payment", { title, quantity, unit_price });

      // Usar domain service
      const payment = await PaymentService.createPreference({
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
        body: createPaymentOrderSchema,
      },
    },
    async (request, reply) => {
      const data = request.body;

      //total_amount = soma de todos os valores de amount
      logger.info("Creating payment order", {
        external_reference: data.external_reference,
        payer_email: data.payer.email,
        total_amount: data.payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        ),
      });

      // Usar domain service
      const order = await PaymentService.createOrder(data);

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
    }
  );

  // Rota para buscar pagamento por ID
  app.withTypeProvider<ZodTypeProvider>().get(
    "/payments/:id",
    {
      schema: {
        params: getPaymentParamsSchema,
        response: getPaymentResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      logger.info("Fetching payment", { paymentId: id });

      const payment = await PaymentService.getPaymentById(id);

      return reply.status(200).send(payment);
    }
  );
}
