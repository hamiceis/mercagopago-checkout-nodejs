import { MercadoPagoConfig, Order, Payment, Preference } from "mercadopago";
import { env } from "@/config/env";

// Configuração do cliente MercadoPago
const client = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
});

// Instâncias dos serviços do MercadoPago

// Order: Agrupa vários pagamentos em um único pedido comercial (ex: marketplaces)
export const mercadoPagoOrder = new Order(client);

// Payment: Processa pagamentos via API (Checkout Transparente) e busca dados de transações existentes
export const mercadoPagoPayment = new Payment(client);

// Preference: Cria um link de checkout para pagar no site do Mercado Pago (Checkout Pro)
export const mercadoPagoPreference = new Preference(client);
