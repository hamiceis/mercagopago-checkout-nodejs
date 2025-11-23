import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  MERCADOPAGO_ACCESS_TOKEN: z.string(),
  PUBLIC_KEY: z.string(),
  LOCALHOST: z.string().url()
})


export const env = envSchema.parse(process.env)