import { CreatePaymentOrderSchema } from "utils/schemas";
import { order } from "../utils/mercadopago"
import { randomUUID } from "node:crypto"
import { ClientError } from "../errors/client-error"

export async function createOrder(data: CreatePaymentOrderSchema) {
  try {
    // Validação adicional dos dados
    if (!data.payments || data.payments.length === 0) {
      throw new ClientError("É necessário informar pelo menos um método de pagamento");
    }

    // Verificar se todos os valores são válidos
    for (const payment of data.payments) {
      if (!payment.token) {
        throw new ClientError("Token de pagamento inválido ou não informado");
      }
      
      if (Number(payment.amount) <= 0) {
        throw new ClientError("Valor do pagamento deve ser maior que zero");
      }
    }

    const body = {
      type: "online",
      external_reference: data.external_reference,
      payer: {
        email: data.payer.email,
      },
      transactions: {
        payments: data.payments.map((p) => ({
          amount: p.amount,
          payment_method: {
            id: p.payment_method_id,
            type: "credit_card",
            token: p.token,
          },
          installments: p.installments,
        })),
      },
    };

    // Gerar chave de idempotência para evitar duplicação de pagamentos
    const idempotencyKey = randomUUID();
    console.log("🔑 Chave de idempotência gerada:", idempotencyKey);

    const response = await order.create({
      body: body,
      requestOptions: {
        idempotencyKey: idempotencyKey,
      }
    });

    return response;
  } catch (error: any) {
    // Se já for um ClientError, apenas repassa
    if (error instanceof ClientError) {
      throw error;
    }
    
    // Se for erro da API do Mercado Pago
    if (error.response && error.response.data) {
      console.error("❌ Erro da API do Mercado Pago:", error.response.data);
      throw new ClientError(`Erro ao processar pagamento: ${error.response.data.message || 'Verifique os dados informados'}`);
    }
    
    // Erro genérico
    console.error("❌ Erro ao criar ordem:", error);
    throw new ClientError("Não foi possível processar o pagamento. Tente novamente mais tarde.");
  }
}


//Front-end envia uma requisição POST /orders com corpo como: 

// {
//   "type": "online",
//   "external_reference": "pedido-123",
//   "payer": {
//     "email": "cliente@exemplo.com"
//   },
//   "payments": [
//     {
//       "amount": 50.0,
//       "payment_method_id": "visa",
//       "token": "TOKEN_DO_CARTAO",
//       "installments": 1
//     }
//   ]
// }
