# 💳 Payments Mercado Pago - Clean Architecture

API RESTful para integração com Mercado Pago seguindo **Clean Architecture** com TypeScript, Fastify e Prisma v7.

## 🏗️ Arquitetura

```
┌─────────────┐
│   Routes    │  HTTP Layer (Controllers)
│ (Fastify)   │
└──────┬──────┘
       │
┌──────▼──────┐
│   Domain    │  Business Logic
│  Services   │
└──────┬──────┘
       │
┌──────▼────────────┐
│ Infrastructure   │  External APIs
│  (MercadoPago)   │
└──────────────────┘
```

### **Camadas:**

- **Routes** (`src/routes/`): Controllers HTTP, validação com Zod
- **Domain** (`src/domain/`): Lógica de negócio isolada
- **Infrastructure** (`src/infrastructure/`): Integração com APIs externas
- **Shared** (`src/shared/`): Utilidades compartilhadas

---

## 🚀 Funcionalidades

- ✅ **Checkout Pro** (redirecionamento para Mercado Pago)
- ✅ **Checkout Transparente** (API direta)
- ✅ **Busca de pagamento por ID** (GET /payments/:id)
- ✅ **Webhooks** com processamento de status
- ✅ **Validações robustas** (Zod + Domain rules)
- ✅ **Clean Architecture** (testável e manutenível)
- ✅ **Prisma v7** (Config-Only + Driver Adapters)
- ✅ **Error Handler** global
- ✅ **Logs estruturados**

---

## 📋 Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- Conta no **Mercado Pago** (sandbox para testes)

---

## 🛠️ Instalação

### **1. Clone e instale**

```bash
git clone <seu-repositorio>
cd payments_mercadopago
npm install
```

### **2. Configure variáveis de ambiente**

Crie `.env` na raiz:

```env
PORT=3333
MERCADOPAGO_ACCESS_TOKEN=TEST-your-token-here
PUBLIC_KEY=TEST-your-public-key
LOCALHOST=http://localhost:3333
DATABASE_URL=file:./dev.db
NODE_ENV=development
```

### **3. Execute**

```bash
npm run dev
```

Servidor rodando em `http://localhost:3333` ✅

---

## 📁 Estrutura do Projeto

```
src/
├── config/                 # Configurações
│   ├── env.ts             # Variáveis de ambiente (Zod validation)
│   ├── cors.config.ts     # Configuração de CORS
│   ├── constants.ts       # Constantes da aplicação
│   └── index.ts
│
├── routes/                 # HTTP Controllers
│   ├── create-payment.ts  # POST /payments/preferences, /payments/order
│   │                      # GET /payments/:id (buscar pagamento)
│   ├── status-routes.ts   # GET /success, /failure, /pending
│   └── webhook.ts         # POST /webhook
│
├── domain/                 # Business Logic (DDD)
│   ├── payment/
│   │   ├── payment.service.ts  # Lógica de negócio de pagamentos
│   │   │                       # - createPreference
│   │   │                       # - createOrder
│   │   │                       # - getPaymentById (novo)
│   │   └── index.ts
│   └── webhook/
│       ├── webhook.service.ts  # Processamento de webhooks
│       └── index.ts
│
├── infrastructure/         # External APIs & Integrations
│   └── mercadopago/
│       ├── client.ts      # SDK config (Order, Payment, Preference)
│       ├── mappers/       # Domain ↔ API conversion
│       │   ├── payment.mapper.ts
│       │   └── order.mapper.ts
│       └── index.ts
│
├── schemas/                # Zod Validation Schemas
│   ├── payment.schema.ts  # Schemas para operações de pagamento
│   ├── status.schema.ts   # Schemas para rotas de status (novo)
│   ├── webhook.schema.ts  # Schemas para webhooks
│   └── index.ts           # Barrel export
│
├── types/                  # TypeScript Type Definitions
│   ├── api/               # API response/request types
│   │   ├── payment.types.ts
│   │   └── webhook.types.ts
│   ├── domain/            # Domain entity types
│   │   └── payment.domain.ts
│   └── index.ts
│
├── shared/                 # Shared Utilities
│   ├── errors/            # Error Handling System
│   │   ├── app-error.ts   # Custom error class
│   │   ├── error-codes.ts # Error code enum
│   │   ├── error-handler.ts  # Global error handler
│   │   └── index.ts
│   ├── logger/            # Structured Logging
│   │   ├── logger.ts      # Logger implementation
│   │   └── index.ts
│   └── utils/             # Utility functions
│       ├── formatters.ts
│       └── index.ts
│
├── lib/                    # External Libraries
│   └── prisma.ts          # Prisma client (v7 config)
│
└── server.ts               # Application entry point
```

---

## 🛣️ API Endpoints

### **1. Health Check**

```http
GET /
```

**Response:**

```json
{ "message": "Hello World" }
```

### **2. Criar Preference (Checkout Pro)**

```http
POST /payments/preferences
```

**Request:**

```json
{
  "title": "Compra de Rifa",
  "quantity": 3,
  "unit_price": 15.5
}
```

**Validações:**

- `title`: 3-100 caracteres, apenas letras/números/pontuação
- `quantity`: 1-999 unidades
- `unit_price`: R$ 0,01 - R$ 999.999,99
- Valor total máximo: R$ 100.000,00

**Response:**

```json
{
  "id": "2944586916-bce4ebf3...",
  "init_point": "https://www.mercadopago.com/checkout/...",
  "sandbox_init_point": "https://sandbox.mercadopago.com/...",
  "available_methods": "PIX e Cartão de Crédito"
}
```

### **3. Criar Order (Checkout Transparente)**

```http
POST /payments/order
```

**Request:**

```json
{
  "type": "online",
  "external_reference": "ORD-123",
  "payer": {
    "email": "[email protected]"
  },
  "payments": [
    {
      "amount": "50.00",
      "payment_method_id": "pix",
      "token": "card-token-from-frontend",
      "installments": 1
    }
  ]
}
```

**Validações:**

- `email`: formato válido, max 255 chars
- `amount`: número positivo, max R$ 999.999,99
- `token`: 10-500 caracteres
- `installments`: 1-12 parcelas
- Max 5 métodos de pagamento por ordem

**Response:**

```json
{
  "id": "123456789",
  "status": "pending",
  "created_at": "2025-12-27T...",
  "external_reference": "ORD-123",
  "message": "Ordem de pagamento criada com sucesso"
}
```

### **4. Buscar Pagamento por ID**

```http
GET /payments/:id
```

**Descrição:** Busca informações detalhadas de um pagamento pelo ID.

**Parâmetros:**

- `id` (path): ID do pagamento (obrigatório)

**Response (200 - Sucesso):**

```json
{
  "id": 123456789,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 50.0,
  "payment_method_id": "pix",
  "payment_type_id": "bank_transfer",
  "date_created": "2025-12-31T14:30:00.000Z",
  "date_approved": "2025-12-31T14:30:05.000Z",
  "external_reference": "ORDER-001",
  "installments": 1,
  "payer": {
    "email": "[email protected]",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

**Response (404 - Não Encontrado):**

```json
{
  "statusCode": 404,
  "code": "PAYMENT_NOT_FOUND",
  "message": "Pagamento não encontrado"
}
```

**Exemplo:**

```bash
curl http://localhost:3333/payments/123456789
```

### **5. Status Routes**

```http
GET /success?payment_id=123&status=approved
GET /failure?payment_id=123&status=rejected
GET /pending?payment_id=123&status=pending
```

### **6. Webhook**

```http
POST /webhook
```

**Request (enviado pelo Mercado Pago):**

```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

**Response:**

```json
{
  "message": "Pagamento aprovado com sucesso!",
  "status": "approved",
  "payment_id": "123456789",
  "amount": 50.0
}
```

---

## 🧪 Exemplos de Uso

### **cURL - Criar Preference**

```bash
curl -X POST http://localhost:3333/payments/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Produto Teste",
    "quantity": 1,
    "unit_price": 99.90
  }'
```

### **JavaScript - Criar Order**

```javascript
const response = await fetch("/payments/order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "online",
    external_reference: "ORD-" + Date.now(),
    payer: { email: "[email protected]" },
    payments: [
      {
        amount: "99.90",
        payment_method_id: "pix",
        token: cardToken,
        installments: 1,
      },
    ],
  }),
});
const order = await response.json();
```

---

## 🔧 Tecnologias

### **Core:**

- **Fastify** 5.x - Framework web
- **TypeScript** - Type safety
- **Zod** - Runtime validation
- **Prisma** 7.2.0+ - ORM (Config-Only)

### **Infrastructure:**

- **MercadoPago SDK** - Payment processing
- **Better SQLite3** - Database driver
- **Driver Adapters** - Prisma v7 connection

### **Development:**

- **tsx** - TypeScript executor
- **tsconfig-paths** - Path aliases

---

## 🎯 Validações Implementadas

### **Payment Schema:**

- Título: min 3, max 100 chars, regex para caracteres permitidos
- Quantidade: 1-999
- Preço: R$ 0,01 - R$ 999.999,99, 2 decimais
- Sanitização: `.trim()` em strings

### **Order Schema:**

- Email: validação + `.toLowerCase()` + `.trim()`
- Amount: string validada como número positivo
- Token: 10-500 caracteres
- Installments: 1-12

### **Domain Validations:**

- Valor total máximo: R$ 100.000,00
- Caracteres especiais bloqueados (segurança)

---

## 🐛 Error Codes

```typescript
VALIDATION_ERROR; // Input inválido (400)
INVALID_PAYMENT_DATA; // Dados de pagamento inválidos (400)
INSUFFICIENT_AMOUNT; // Valor insuficiente (400)
AMOUNT_TOO_HIGH; // Valor acima do limite (400)
PAYMENT_NOT_FOUND; // Pagamento não encontrado (404)
MERCADOPAGO_API_ERROR; // Erro da API externa (500)
INTERNAL_ERROR; // Erro interno (500)
```

---

## 🗄️ Prisma v7 (Config-Only)

### **Características:**

- ✅ Sem URL no `schema.prisma`
- ✅ Configuração em `prisma.config.ts`
- ✅ Driver Adapters (better-sqlite3)

### **Comandos:**

```bash
npx prisma migrate dev --name <nome>
npx prisma studio
npx prisma generate
```

---

## 🔒 Segurança

- ✅ Validação em **3 camadas** (Zod, Domain, Infrastructure)
- ✅ Sanitização de inputs (`.trim()`, `.toLowerCase()`)
- ✅ Regex para prevenir XSS/injection
- ✅ Limites de valores (preço, quantidade, total)
- ✅ Error handler sem vazamento de dados sensíveis
- ✅ Variáveis de ambiente para tokens

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add: nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

ISC License

---

**Made with ❤️ following Clean Architecture principles**
