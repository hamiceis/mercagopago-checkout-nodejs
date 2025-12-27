import { preference } from "utils/mercadopago";
import crypto from "node:crypto";
import { env } from "@/config/env";
import { logger } from "@/shared/logger";
import { PaymentPreference } from "@/types";

interface ICreatePayment {
  title: string;
  quantity: number;
  price: number;
}

export async function createPayment({
  title,
  price,
  quantity,
}: PaymentPreference) {
  logger.info("Creating payment preference", { title, quantity, price });

  const response = await preference.create({
    body: {
      items: [
        {
          id: crypto.randomUUID(),
          title,
          quantity,
          unit_price: price,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${env.LOCALHOST}/success`,
        failure: `${env.LOCALHOST}/failure`,
        pending: `${env.LOCALHOST}/pending`,
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [{ id: "credit_card" }, { id: "ticket" }],
      },
    },
  });

  logger.info("Payment preference created", { preferenceId: response.id });

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    available_methods: "PIX e Cartão de Crédito",
  };
}
