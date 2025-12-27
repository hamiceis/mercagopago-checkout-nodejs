/**
 * Payment Configuration
 * Configurações relacionadas aos métodos de pagamento do Mercado Pago
 */
export const PAYMENT_CONFIG = {
  EXCLUDED_PAYMENT_TYPES: [
    { id: "credit_card" }, // Cartão de crédito
    { id: "ticket" }, // Boleto/Tickets
  ] as const,

  EXCLUDED_PAYMENT_METHODS: [] as const,
  AVAILABLE_METHODS: "PIX e Cartão de débito",
  DEFAULT_CURRENCY: "BRL",
} as const;

/**
 * HTTP Status Messages
 * Mensagens padrão para respostas HTTP
 */
export const HTTP_MESSAGES = {
  HELLO_WORLD: "Hello World",
  PAYMENT_APPROVED: "Pagamento aprovado com sucesso!",
  PAYMENT_REJECTED: "Pagamento rejeitado",
  PAYMENT_CANCELLED: "Pagamento cancelado",
  PAYMENT_STATUS_UNKNOWN: "Status de pagamento não reconhecido",
  ORDER_CREATED: "Ordem de pagamento criada com sucesso",
  WEBHOOK_TYPE_NOT_SUPPORTED: "Tipo de webhook não suportado",
  INVALID_DATA: "Dados inválidos",
  INTERNAL_ERROR: "Erro interno do servidor",
  PAYMENT_NOT_FOUND: "Pagamento não encontrado",
  PAYMENT_ERROR: "Erro ao processar pagamento. Tente novamente mais tarde.",
} as const;

/**
 * Log Emojis
 * Emojis padronizados para logs (facilita identificação visual)
 */
export const LOG_EMOJI = {
  CART: "🛒",
  CARD: "💳",
  PACKAGE: "📦",
  SUCCESS: "✅",
  ERROR: "❌",
  WEBHOOK: "🔔",
  INFO: "📊",
  WARNING: "⚠️",
  PENDING: "⏳",
  STOPPED: "⏹️",
  QUESTION: "❓",
  KEY: "🔑",
  FIRE: "🚀",
} as const;

//status de pagamento
export const PAYMENT_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  PENDING: "pending",
} as const;

/**
 * Webhook Types
 * Tipos de webhook suportados pelo Mercado Pago
 */
export const WEBHOOK_TYPES = {
  PAYMENT: "payment",
} as const;
