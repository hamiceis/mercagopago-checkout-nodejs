// Entidade de domínio: Preferência de Pagamento(Payment Preference: back-end)
export interface PaymentPreference {
  title: string;
  quantity: number;
  price: number;
}

// Entidade de domínio: Ordem de Pagamento(Payment Order: front-end)
export interface PaymentOrder {
  id: string;
  status: string;
  externalReference: string;
  payerEmail: string;
  totalAmount: number;
}
