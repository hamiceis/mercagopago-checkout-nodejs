import { CreatePaymentOrderSchema } from "utils/schemas";
import { payment } from "../utils/mercadopago";
import { randomUUID } from "node:crypto";
import { AppError, ERROR_CODES } from "@/shared/errors";
import { logger } from "@/shared/logger";


//cria um pedido de pagamento quando tem um front-end
export async function createOrder(data: CreatePaymentOrderSchema) {
  try {
    if (!data.payments || data.payments.length === 0) {
      throw new AppError(
        "É necessário informar pelo menos um método de pagamento",
        400,
        ERROR_CODES.INVALID_PAYMENT_DATA
      );
    }

    const results = [];

    for (const paymentItem of data.payments) {
      if (!paymentItem.token) {
        throw new AppError(
          "Token de pagamento inválido ou não informado",
          400,
          ERROR_CODES.INVALID_PAYMENT_DATA
        );
      }

      if (Number(paymentItem.amount) <= 0) {
        throw new AppError(
          "Valor do pagamento deve ser maior que zero",
          400,
          ERROR_CODES.INSUFFICIENT_AMOUNT
        );
      }
      //idempotencyKey é um identificador único para cada pagamento
      const idempotencyKey = randomUUID();
      logger.info("Processing payment", {
        amount: paymentItem.amount,
        idempotencyKey,
      });

      const paymentData = {
        transaction_amount: Number(paymentItem.amount),
        token: paymentItem.token,
        description: `Pagamento ref: ${data.external_reference}`,
        installments: paymentItem.installments,
        payment_method_id: paymentItem.payment_method_id,
        payer: {
          email: data.payer.email,
        },
        external_reference: data.external_reference,
      };

      const response = await payment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey: idempotencyKey,
        },
      });

      results.push(response);
    }

    return results[0];
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.response && error.response.data) {
      logger.error("MercadoPago API error", { error: error.response.data });
      const message =
        error.response.data.message || "Verifique os dados informados";
      const detail = error.response.data.cause?.[0]?.description || "";
      throw new AppError(
        `Erro ao processar pagamento: ${message} ${detail}`,
        400,
        ERROR_CODES.MERCADOPAGO_API_ERROR
      );
    }

    logger.error("Error creating order", { error: error.message });
    throw new AppError(
      "Não foi possível processar o pagamento. Tente novamente mais tarde.",
      500,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
}

//Front-end envia uma requisição POST /orders com corpo como:

// {
//   "type": "online",
//   "external_reference": "pedido-123",
//   "payer": {
//     "email": "cliente@exemplo.com"
//   },
//   "payments": [
//     {
//       "amount": 50.0,
//       "payment_method_id": "visa",
//       "token": "TOKEN_DO_CARTAO",
//       "installments": 1
//     }
//   ]
// }
