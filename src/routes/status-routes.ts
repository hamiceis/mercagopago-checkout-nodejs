import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import dayjs from "dayjs";
import { StatusQuerySchema, StatusResponseSchema } from "@/schemas";

// Função helper para criar resposta
function createStatusResponse(
  message: string,
  queryParams: z.infer<typeof StatusQuerySchema>
) {
  return {
    message,
    payment_id: queryParams.payment_id,
    status: queryParams.status,
    external_reference: queryParams.external_reference,
    merchant_order_id: queryParams.merchant_order_id,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };
}

// Função helper para log
function logPaymentStatus(
  emoji: string,
  status: string,
  params: z.infer<typeof StatusQuerySchema>
) {
  console.log(`${emoji} ${status}:`, {
    payment_id: params.payment_id,
    status: params.status,
    external_reference: params.external_reference,
    merchant_order_id: params.merchant_order_id,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  });
}

export async function statusRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/success",
    {
      schema: {
        querystring: StatusQuerySchema,
        response: StatusResponseSchema,
      },
    },
    async (request, reply) => {
      const queryParams = request.query;

      logPaymentStatus("✅", "Pagamento aprovado", queryParams);

      return reply
        .status(200)
        .send(
          createStatusResponse("Pagamento aprovado com sucesso!", queryParams)
        );
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/failure",
    {
      schema: {
        querystring: StatusQuerySchema,
        response: StatusResponseSchema,
      },
    },
    async (request, reply) => {
      const queryParams = request.query;

      logPaymentStatus("❌", "Pagamento rejeitado", queryParams);

      return reply
        .status(200)
        .send(
          createStatusResponse(
            "Pagamento foi rejeitado. Tente novamente com outro método de pagamento.",
            queryParams
          )
        );
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/pending",
    {
      schema: {
        querystring: StatusQuerySchema,
        response: StatusResponseSchema,
      },
    },
    async (request, reply) => {
      const queryParams = request.query;

      logPaymentStatus("⏳", "Pagamento pendente", queryParams);

      return reply
        .status(200)
        .send(
          createStatusResponse(
            "Pagamento está sendo processado. Você receberá uma notificação quando for confirmado.",
            queryParams
          )
        );
    }
  );
}
