import { CreatePaymentOrderSchema } from "utils/schemas";
import { payment } from "../utils/mercadopago";
import { randomUUID } from "node:crypto";
import { ClientError } from "../errors/client-error";

export async function createOrder(data: CreatePaymentOrderSchema) {
  try {
    // Validação adicional dos dados
    if (!data.payments || data.payments.length === 0) {
      throw new ClientError(
        "É necessário informar pelo menos um método de pagamento"
      );
    }

    const results = [];

    // Processar cada pagamento individualmente
    // Nota: A API de Pagamentos do Mercado Pago processa uma transação por vez.
    for (const paymentItem of data.payments) {
      if (!paymentItem.token) {
        throw new ClientError("Token de pagamento inválido ou não informado");
      }

      if (Number(paymentItem.amount) <= 0) {
        throw new ClientError("Valor do pagamento deve ser maior que zero");
      }

      // Gerar chave de idempotência para cada pagamento
      const idempotencyKey = randomUUID();
      console.log(
        `🔑 Processando pagamento ${paymentItem.amount} - Chave: ${idempotencyKey}`
      );

      const paymentData = {
        transaction_amount: Number(paymentItem.amount),
        token: paymentItem.token,
        description: `Pagamento ref: ${data.external_reference}`,
        installments: paymentItem.installments,
        payment_method_id: paymentItem.payment_method_id,
        payer: {
          email: data.payer.email,
        },
        external_reference: data.external_reference,
      };

      const response = await payment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey: idempotencyKey,
        },
      });

      results.push(response);
    }

    // Retorna o primeiro resultado para manter compatibilidade simples,
    // ou poderia retornar um array se o frontend esperar isso.
    // Dado o retorno original, vamos retornar o primeiro sucesso.
    return results[0];
  } catch (error: any) {
    // Se já for um ClientError, apenas repassa
    if (error instanceof ClientError) {
      throw error;
    }

    // Se for erro da API do Mercado Pago
    if (error.response && error.response.data) {
      console.error("❌ Erro da API do Mercado Pago:", error.response.data);
      const message =
        error.response.data.message || "Verifique os dados informados";
      const detail = error.response.data.cause?.[0]?.description || "";
      throw new ClientError(
        `Erro ao processar pagamento: ${message} ${detail}`
      );
    }

    // Erro genérico
    console.error("❌ Erro ao criar ordem:", error);
    throw new ClientError(
      "Não foi possível processar o pagamento. Tente novamente mais tarde."
    );
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
