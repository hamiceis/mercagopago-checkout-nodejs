import { PaymentPreference, CreatePaymentOrderRequest } from "@/types";
import {
  CreatePaymentResponse,
  GetPaymentResponse,
} from "@/types/api/payment.types";
import { AppError, ERROR_CODES } from "@/shared/errors";
import { logger } from "@/shared/logger";
import {
  mercadoPagoPreference,
  mercadoPagoPayment,
  PaymentMapper as InfraMapper,
  OrderMapper as InfraOrderMapper,
} from "@/infrastructure/mercadopago";
import { env } from "@/config/env";

// Cria preference de pagamento (Checkout Pro)
export const createPreference = async (
  data: PaymentPreference
): Promise<CreatePaymentResponse> => {
  // Validação de negócio
  if (data.price <= 0) {
    throw new AppError(
      "Preço deve ser maior que zero",
      400,
      ERROR_CODES.INVALID_PAYMENT_DATA
    );
  }

  if (data.quantity <= 0) {
    throw new AppError(
      "Quantidade deve ser maior que zero",
      400,
      ERROR_CODES.INVALID_PAYMENT_DATA
    );
  }

  // Validar valor total
  const totalAmount = data.price * data.quantity;
  if (totalAmount > 100000) {
    throw new AppError(
      "Valor total não pode exceder R$ 100.000,00",
      400,
      ERROR_CODES.AMOUNT_TOO_HIGH
    );
  }

  logger.info("Creating payment preference", {
    title: data.title,
    quantity: data.quantity,
    price: data.price,
  });

  // URLs de retorno
  const backUrls = {
    success: `${env.LOCALHOST}/success`,
    failure: `${env.LOCALHOST}/failure`,
    pending: `${env.LOCALHOST}/pending`,
  };

  // Criar request usando infrastructure mapper
  const preferenceRequest = InfraMapper.toPreferenceRequest(data, backUrls);

  // Chamar API via infrastructure
  const response = await mercadoPagoPreference.create({
    body: preferenceRequest,
  });

  logger.info("Payment preference created", { preferenceId: response.id });

  // Retornar resposta mapeada pela infrastructure
  return InfraMapper.toPreferenceResponse(response);
};

// Cria ordem de pagamento (Checkout Transparente)
export const createOrder = async (data: CreatePaymentOrderRequest) => {
  // Validação de negócio
  if (!data.payments || data.payments.length === 0) {
    throw new AppError(
      "É necessário informar pelo menos um método de pagamento",
      400,
      ERROR_CODES.INVALID_PAYMENT_DATA
    );
  }

  const results = [];

  for (const paymentItem of data.payments) {
    // Validações de negócio
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

    const idempotencyKey = InfraOrderMapper.generateIdempotencyKey();

    logger.info("Processing payment", {
      amount: paymentItem.amount,
      idempotencyKey,
    });

    // Mapear usando infrastructure mapper
    const paymentData = InfraOrderMapper.toPaymentRequest(data, paymentItem);

    try {
      // Chamar API via infrastructure
      const response = await mercadoPagoPayment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey: idempotencyKey,
        },
      });

      results.push(response);
    } catch (error: any) {
      // Tratamento de erros da API
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

  return results[0];
};

// Busca pagamento por ID
export const getPaymentById = async (
  paymentId: string
): Promise<GetPaymentResponse> => {
  if (!paymentId || paymentId.trim() === "") {
    throw new AppError(
      "ID do pagamento é obrigatório",
      400,
      ERROR_CODES.INVALID_PAYMENT_DATA
    );
  }

  logger.info("Fetching payment by ID", { paymentId });

  try {
    const paymentInfo = await mercadoPagoPayment.get({ id: paymentId });

    logger.info("Payment retrieved successfully", {
      id: paymentInfo.id,
      status: paymentInfo.status,
    });

    // Mapear resposta para o formato esperado
    const response: GetPaymentResponse = {
      id: paymentInfo.id!,
      status: paymentInfo.status!,
      status_detail: paymentInfo.status_detail || undefined,
      transaction_amount: paymentInfo.transaction_amount!,
      payment_method_id: paymentInfo.payment_method_id || undefined,
      payment_type_id: paymentInfo.payment_type_id || undefined,
      date_created: paymentInfo.date_created!,
      date_approved: paymentInfo.date_approved || undefined,
      external_reference: paymentInfo.external_reference || undefined,
      installments: paymentInfo.installments || undefined,
      payer: paymentInfo.payer
        ? {
            email: paymentInfo.payer.email || undefined,
            identification: paymentInfo.payer.identification
              ? {
                  type: paymentInfo.payer.identification.type || undefined,
                  number: paymentInfo.payer.identification.number || undefined,
                }
              : undefined,
          }
        : undefined,
    };

    return response;
  } catch (error: any) {
    logger.error("Error fetching payment", {
      error: error.message,
      paymentId,
    });

    if (
      error.message?.includes("not found") ||
      error.status === 404 ||
      error.statusCode === 404
    ) {
      throw new AppError(
        "Pagamento não encontrado",
        404,
        ERROR_CODES.PAYMENT_NOT_FOUND
      );
    }

    throw new AppError(
      "Erro ao buscar informações do pagamento",
      500,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
};
