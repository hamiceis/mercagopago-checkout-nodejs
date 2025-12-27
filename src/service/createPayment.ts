import { env } from "@/config/env";
import { logger } from "@/shared/logger";
import { PaymentPreference } from "@/types";
import { CreatePaymentResponse } from "@/types/api/payment.types";
import {
  mercadoPagoPreference,
  PaymentMapper,
} from "@/infrastructure/mercadopago";

export async function createPayment({
  title,
  price,
  quantity,
}: PaymentPreference): Promise<CreatePaymentResponse> {
  logger.info("Creating payment preference", { title, quantity, price });

  const backUrls = {
    success: `${env.LOCALHOST}/success`,
    failure: `${env.LOCALHOST}/failure`,
    pending: `${env.LOCALHOST}/pending`,
  };

  const preferenceRequest = PaymentMapper.toPreferenceRequest(
    { title, price, quantity },
    backUrls
  );

  const response = await mercadoPagoPreference.create({
    body: preferenceRequest,
  });

  logger.info("Payment preference created", { preferenceId: response.id });

  return PaymentMapper.toPreferenceResponse(response);
}

