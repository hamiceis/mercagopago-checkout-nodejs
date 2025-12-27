import { AppError, ERROR_CODES } from "@/shared/errors";
import { logger } from "@/shared/logger";
import { mercadoPagoPayment } from "@/infrastructure/mercadopago";
import { PaymentStatus } from "@/types";

// Processa webhook de pagamento
export const processPayment = async (paymentId: string) => {
  logger.info("Processing payment", { paymentId });

  try {
    // Buscar informações do pagamento via infrastructure
    const paymentInfo = await mercadoPagoPayment.get({ id: paymentId });

    logger.debug("Payment info retrieved", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      amount: paymentInfo.transaction_amount,
      method: paymentInfo.payment_method_id,
    });

    const status = paymentInfo.status as PaymentStatus;

    // Lógica de negócio baseada no status
    switch (status) {
      case "approved":
        logger.info("Payment approved", {
          paymentId,
          amount: paymentInfo.transaction_amount,
        });
        return {
          message: "Pagamento aprovado com sucesso!",
          status: "approved",
          payment_id: paymentId,
          amount: paymentInfo.transaction_amount,
        };

      case "rejected":
        logger.warn("Payment rejected", {
          paymentId,
          reason: paymentInfo.status_detail,
        });
        return {
          message: "Pagamento rejeitado",
          status: "rejected",
          payment_id: paymentId,
          reason: paymentInfo.status_detail,
        };

      case "cancelled":
        logger.warn("Payment cancelled", { paymentId });
        return {
          message: "Pagamento cancelado",
          status: "cancelled",
          payment_id: paymentId,
        };

      default:
        logger.warn("Unknown payment status", { paymentId, status });
        return {
          message: "Status de pagamento não reconhecido",
          status: status,
          payment_id: paymentId,
        };
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
};

// Valida se o tipo de webhook deve ser processado
export const validateWebhookType = (type: string): boolean => {
  return type === "payment";
};
