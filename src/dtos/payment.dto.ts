// DTO para resposta de preferência de pagamento
export interface PaymentPreferenceDTO {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  available_methods: string;
}

// DTO para resposta de ordem de pagamento
export interface PaymentOrderDTO {
  id: string;
  status: string;
  created_at: string;
  external_reference: string;
  message: string;
}
