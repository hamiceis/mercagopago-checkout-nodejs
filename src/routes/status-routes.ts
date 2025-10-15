import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import dayjs from "dayjs";

export async function statusRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/success", {
    schema: {
      querystring: z.object({
        payment_id: z.string().optional(),
        status: z.string().optional(),
        external_reference: z.string().optional(),
        merchant_order_id: z.string().optional(),
      }),
      response: z.object({
        message: z.string(),
        payment_id: z.string().optional(),
        status: z.string().optional(),
        timestamp: z.string(),
      })
    }
  }, async (request, reply) => {
    const { 
      payment_id, 
      status, 
      external_reference, 
      merchant_order_id 
    } = request.query;

    console.log("✅ Pagamento aprovado:", {
      payment_id,
      status,
      external_reference,
      merchant_order_id,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });

    return reply.status(200).send({
      message: "Pagamento aprovado com sucesso!",
      payment_id,
      status,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });
  });

  app.withTypeProvider<ZodTypeProvider>().get("/failure", {
    schema: {
      querystring: z.object({
        payment_id: z.string().optional(),
        status: z.string().optional(),
        external_reference: z.string().optional(),
        merchant_order_id: z.string().optional(),
      }),
      response: z.object({
        message: z.string(),
        payment_id: z.string().optional(),
        status: z.string().optional(),
        timestamp: z.string(),
      })
    }
  }, async (request, reply) => {
    const { 
      payment_id, 
      status, 
      external_reference, 
      merchant_order_id 
    } = request.query;

    console.log("❌ Pagamento rejeitado:", {
      payment_id,
      status,
      external_reference,
      merchant_order_id,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });

    return reply.status(200).send({
      message: "Pagamento foi rejeitado. Tente novamente com outro método de pagamento.",
      payment_id,
      status,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });
  });

  app.withTypeProvider<ZodTypeProvider>().get("/pending", {
    schema: {
      querystring: z.object({
        payment_id: z.string().optional(),
        status: z.string().optional(),
        external_reference: z.string().optional(),
        merchant_order_id: z.string().optional(),
      }),
      response: z.object({
        message: z.string(),
        payment_id: z.string().optional(),
        status: z.string().optional(),
        timestamp: z.string(),
      })
    }
  }, async (request, reply) => {
    const { 
      payment_id, 
      status, 
      external_reference, 
      merchant_order_id 
    } = request.query;

    console.log("⏳ Pagamento pendente:", {
      payment_id,
      status,
      external_reference,
      merchant_order_id,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });

    return reply.status(200).send({
      message: "Pagamento está sendo processado. Você receberá uma notificação quando for confirmado.",
      payment_id,
      status,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    });
  });
}

