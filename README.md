# 💳 Payments Mercado Pago

API para integração com Mercado Pago usando Fastify, TypeScript e Zod para validação.

## 🚀 Funcionalidades

- ✅ **Criação de pagamentos** com PIX e cartão de crédito
- ✅ **Webhook** para notificações de status de pagamento
- ✅ **Validação** com Zod
- ✅ **Error Handler** global
- ✅ **Logs estruturados** com dayjs
- ✅ **TypeScript** para type safety

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Mercado Pago (sandbox para testes)

## 🛠️ Instalação

### **1. Clone o repositório**
```bash
git clone <seu-repositorio>
cd payments_mercadopago
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:

```env
# Porta do servidor (opcional, padrão: 3333)
PORT=3333

# Token de acesso do Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=

# Chave pública do Mercado Pago
PUBLIC_kEY=

# URL base da aplicação (para webhooks)
LOCALHOST=http://localhost:3333
```

### **4. Execute o projeto**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

## 📚 Dependências

### **Produção:**
- `fastify` - Framework web
- `@fastify/cors` - CORS para Fastify
- `fastify-type-provider-zod` - Integração Zod com Fastify
- `mercadopago` - SDK oficial do Mercado Pago
- `zod` - Validação de schemas
- `dayjs` - Manipulação de datas
- `@prisma/client` - ORM para banco de dados

### **Desenvolvimento:**
- `typescript` - TypeScript
- `tsx` - Executor TypeScript
- `@types/node` - Tipos do Node.js
- `@types/mercadopago` - Tipos do Mercado Pago
- `prisma` - CLI do Prisma

## 🛣️ Rotas da API

### **1. Health Check**
```http
GET /
```
**Resposta:**
```json
{
  "message": "Hello World"
}
```

### **2. Criar Pagamento**
```http
POST /payments
```

**Body:**
```json
{
  "title": "Produto Teste",
  "quantity": 1,
  "unit_price": 99.90
}
```

**Resposta:**
```json
{
  "id": "PREF_123456789",
  "init_point": "https://www.mercadopago.com/checkout/v1/redirect?pref_id=PREF_123456789",
  "sandbox_init_point": "https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=PREF_123456789",
  "available_methods": "PIX e Cartão de Crédito"
}
```

**Métodos de pagamento disponíveis:**
- 💳 **Cartão de Crédito**
- 📱 **PIX**

### **3. Webhook (Notificações)**
```http
POST /webhook
```

**Body (enviado pelo Mercado Pago):**
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

**Respostas possíveis:**

**Pagamento Aprovado:**
```json
{
  "message": "Pagamento aprovado com sucesso!",
  "status": "approved",
  "payment_id": "123456789",
  "amount": 99.90
}
```

**Pagamento Rejeitado:**
```json
{
  "message": "Pagamento rejeitado",
  "status": "rejected",
  "payment_id": "123456789",
  "reason": "cc_rejected_insufficient_amount"
}
```

**Pagamento Cancelado:**
```json
{
  "message": "Pagamento cancelado",
  "status": "cancelled",
  "payment_id": "123456789"
}
```

## 🧪 Como Testar

### **1. Criar um pagamento**
```bash
curl -X POST http://localhost:3333/payments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Produto Teste",
    "quantity": 1,
    "unit_price": 99.90
  }'
```

### **2. Testar webhook**
```bash
curl -X POST http://localhost:3333/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

### **3. Testar validação (erro)**
```bash
curl -X POST http://localhost:3333/payments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "unit_price": -10
  }'
```

## 🔧 Configuração do Mercado Pago

### **1. Sandbox (Desenvolvimento)**
- Use tokens que começam com `TEST-`
- Use `sandbox_init_point` para testes
- Cartões de teste disponíveis no painel

### **2. Produção**
- Use tokens que começam com `APP-`
- Use `init_point` para pagamentos reais
- Configure webhook no painel do Mercado Pago

### **3. Configurar Webhook**
No painel do Mercado Pago:
- **URL:** `https://seuapp.com/webhook`
- **Eventos:** `payment`

## 📁 Estrutura do Projeto

```
src/
├── errors/
│   ├── client-error.ts      # Classe para erros customizados
│   ├── error-handler.ts     # Error handler global
│   └── README.md           # Guia detalhado de error handler
├── routes/
│   ├── create-payment.ts    # Rota de criação de pagamento
│   └── webhook.ts          # Rota de webhook
├── service/
│   └── createPayment.ts     # Lógica de criação de pagamento
├── utils/
│   ├── mercadopago.ts      # Configuração do Mercado Pago
│   └── schemas.ts          # Schemas de validação Zod
├── lib/
│   └── prisma.ts           # Configuração do Prisma
└── server.ts               # Servidor principal
```

## 🚨 Error Handler

O projeto inclui um sistema completo de tratamento de erros:

- ✅ **Validação automática** com Zod
- ✅ **Erros customizados** com ClientError
- ✅ **Logs estruturados** com dayjs
- ✅ **Respostas padronizadas**

Para mais detalhes, consulte:
- `guia-errorhandler.md` - Guia rápido
- `src/errors/README.md` - Guia completo

## 🐛 Logs de Debug

O sistema gera logs estruturados para facilitar o debug:

```
🛒 Criando pagamento: { title: 'Produto Teste', quantity: 1, unit_price: 99.9, available_methods: 'PIX e Cartão de Crédito' }
💳 Métodos disponíveis: PIX e Cartão de Crédito
✅ Preferência criada: { id: 'PREF_123456', init_point: 'https://...', available_methods: 'PIX e Cartão de Crédito' }
```

```
🔔 Webhook chamado: { type: 'payment', data: { id: '123456789' }, timestamp: '2024-01-15 10:30:00' }
💳 Processando pagamento ID: 123456789
📊 Informações do pagamento: { id: '123456789', status: 'approved', payment_method_id: 'pix', ... }
✅ Pagamento APROVADO: { paymentId: '123456789', amount: 99.9 }
```

## 🎯 Fluxo de Pagamento

### **1. Cliente inicia pagamento**
```javascript
// Frontend
const response = await fetch('/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    title: 'Produto', 
    unit_price: 99.90 
  })
})
const { init_point } = await response.json()
window.location.href = init_point
```

### **2. Cliente paga no Mercado Pago**
- Escolhe entre PIX ou cartão de crédito
- Preenche dados do pagamento
- Confirma o pagamento

### **3. Mercado Pago notifica via webhook**
- Chama automaticamente `POST /webhook`
- Seu sistema processa o status
- Cliente é redirecionado para suas URLs

## 🔒 Segurança

- ✅ **Validação** de todos os inputs com Zod
- ✅ **Error handler** para capturar erros
- ✅ **CORS** configurado
- ✅ **Variáveis de ambiente** para tokens sensíveis
- ✅ **Logs** sem informações sensíveis

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build (se configurado)
npm run build

# Testes (se configurado)
npm test
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

ISC License

---

**🚀 Projeto pronto para uso em desenvolvimento e produção!**
