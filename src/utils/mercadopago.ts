import { MercadoPagoConfig, Order, Payment, Preference } from "mercadopago";
import { env } from "@/config/env";

const client = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
});

const order = new Order(client);

const payment = new Payment(client);

const preference = new Preference(client);

export { order, payment, preference };
