import { z } from "zod";

//Todas as variáveis importantes da aplicação
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),

  // Ambiente de execução (opcional, padrão: development)
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Token de acesso do Mercado Pago (obrigatório)
  MERCADOPAGO_ACCESS_TOKEN: z
    .string()
    .min(1, "MERCADOPAGO_ACCESS_TOKEN é obrigatório"),

  // Chave pública do Mercado Pago (obrigatório)
  PUBLIC_KEY: z.string().min(1, "PUBLIC_KEY é obrigatório"),

  // URL base da aplicação para webhooks (obrigatório)
  LOCALHOST: z.string().url("LOCALHOST deve ser uma URL válida"),

  // URL de conexão com o banco de dados (obrigatório)
  DATABASE_URL: z.string().min(1, "DATABASE_URL deve ser uma URL válida"),
});

/**
 * Validated environment variables
 * Acessível em toda a aplicação através de: import { env } from "@/config/env"
 */
export const env = envSchema.parse(process.env);


// Type of environment variables (útil para testes e mocks)
 
export type Env = z.infer<typeof envSchema>;
