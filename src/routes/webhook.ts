import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { WebhookSchema, PaymentStatus } from "../utils/schemas";
import { payment } from "../utils/mercadopago";
import { ClientError } from "../errors/client-error";
import dayjs from "dayjs";

export const webhookRoute = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post("/webhook", {
    schema: {
      body: WebhookSchema
    }
  }, async(request, reply) => {
    const { type, data } = request.body

    // 🐛 DEBUG: Log quando webhook é chamado
    console.log("🔔 Webhook chamado:", { type, data, timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss") }) // 📅 DAYJS: Usar dayjs para timestamp formatado

    if(type === "payment") {
      const paymentId = data.id

      // 🐛 DEBUG: Log do ID do pagamento recebido
      console.log("💳 Processando pagamento ID:", paymentId)

      try {
        // Buscar informações do pagamento no Mercado Pago
        const paymentInfo = await payment.get({ id: paymentId })
        
        // 🐛 DEBUG: Log completo das informações do pagamento
        console.log("📊 Informações do pagamento:", {
          id: paymentInfo.id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail,
          transaction_amount: paymentInfo.transaction_amount,
          payment_method_id: paymentInfo.payment_method_id,
          date_approved: paymentInfo.date_approved
        })
        
        const status = paymentInfo.status as PaymentStatus

        // Verificar status do pagamento
        switch (status) {
          case "approved":
            // 🐛 DEBUG: Log de pagamento aprovado
            console.log("✅ Pagamento APROVADO:", { paymentId, amount: paymentInfo.transaction_amount })
            return reply.status(200).send({ 
              message: "Pagamento aprovado com sucesso!",
              status: "approved",
              payment_id: paymentId,
              amount: paymentInfo.transaction_amount
            })
          
          case "rejected":
            // 🐛 DEBUG: Log de pagamento rejeitado
            console.log("❌ Pagamento REJEITADO:", { paymentId, reason: paymentInfo.status_detail })
            return reply.status(400).send({ 
              message: "Pagamento rejeitado",
              status: "rejected",
              payment_id: paymentId,
              reason: paymentInfo.status_detail
            })
          
          case "cancelled":
            // 🐛 DEBUG: Log de pagamento cancelado
            console.log("⏹️ Pagamento CANCELADO:", { paymentId })
            return reply.status(400).send({ 
              message: "Pagamento cancelado",
              status: "cancelled",
              payment_id: paymentId
            })
          
          default:
            // 🐛 DEBUG: Log de status não reconhecido
            console.log("❓ Status não reconhecido:", { paymentId, status })
            return reply.status(200).send({ 
              message: "Status de pagamento não reconhecido",
              status: status,
              payment_id: paymentId
            })
        }

      } catch(error: any) {
        console.log({ error, message: "Error webhook", paymentId })
        
        // 🚨 ERROR: Usar ClientError para erros específicos
        if (error.message?.includes("not found")) {
          throw new ClientError("Pagamento não encontrado")
        }
        
        // 🚨 ERROR: Re-throw para o error handler global capturar
        throw error
      }
    }

    return reply.status(400).send({ 
      message: "Tipo de webhook não suportado",
      type: type
    })
  })
}