import type { FastifyCorsOptions } from "@fastify/cors";

/**
 
 * Em produção, substitua "*" por domínios específicos:
 * origin: ["https://seusite.com", "https://app.seusite.com"]
 */
export const corsConfig: FastifyCorsOptions = {
  origin: "*", // Em produção: usar domínios específicos
  credentials: false,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
