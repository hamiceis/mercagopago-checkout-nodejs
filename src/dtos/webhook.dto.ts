// DTO para resposta de webhook
export interface WebhookResponseDTO {
  payment_id: string;
  message: string;
  status: string;
  amount?: number;
  reason?: string;
}
