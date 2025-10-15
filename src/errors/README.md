# 🚨 Error Handler

Este diretório contém o sistema de tratamento de erros da aplicação.

## 📁 Arquivos

- `client-error.ts` - Classe para erros customizados do cliente
- `error-handler.ts` - Error handler global do Fastify

## 🛠️ Como criar um Error Handler (Passo a Passo)

### **Passo 1: Criar a classe ClientError**
```typescript
// src/errors/client-error.ts
export class ClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClientError'
  }
}
```

### **Passo 2: Instalar dependências necessárias**
```bash
npm install dayjs  # Para formatação de timestamps
```

### **Passo 3: Criar o Error Handler Global**
```typescript
// src/errors/error-handler.ts
import { FastifyInstance } from "fastify"
import { ClientError } from "./client-error"
import { ZodError } from "zod"
import dayjs from "dayjs"

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // Log do erro para debug
  console.log("🚨 Erro capturado:", {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
  })

  // Tratar erros de validação (Zod)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Dados inválidos",
      errors: error.flatten().fieldErrors,
      statusCode: 400
    })
  }

  // Tratar erros customizados do cliente
  if (error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message,
      statusCode: 400
    })
  }

  // Tratar erros internos do servidor
  return reply.status(500).send({ 
    message: "Erro interno do servidor",
    statusCode: 500
  })
}
```

### **Passo 4: Registrar no servidor**
```typescript
// src/server.ts
import { errorHandler } from "./errors/error-handler"

const app = Fastify()

// Registrar error handler global
app.setErrorHandler(errorHandler)
```

### **Passo 5: Usar nas rotas**
```typescript
// Em qualquer rota
import { ClientError } from "../errors/client-error"

// Para erros de negócio
if (paymentNotFound) {
  throw new ClientError("Pagamento não encontrado")
}

// Para erros de validação (automático com Zod)
// Não precisa fazer nada, o error handler captura automaticamente
```

## 💡 Dicas e Boas Práticas

### **1. Ordem de verificação no Error Handler**
```typescript
// ✅ ORDEM CORRETA: Do mais específico para o mais genérico
if (error instanceof ZodError) {        // 1º - Validação
  // ...
}
if (error instanceof ClientError) {     // 2º - Erro do cliente
  // ...
}
// 3º - Erro genérico (500)             // 3º - Erro interno
```

### **2. Criar classes específicas para diferentes tipos**
```typescript
// src/errors/validation-error.ts
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// src/errors/database-error.ts
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}
```

### **3. Usar try/catch nas rotas**
```typescript
// ✅ BOM: Deixar o error handler capturar
try {
  const result = await someOperation()
  return result
} catch (error) {
  // Re-throw para o error handler global
  throw error
}

// ❌ RUIM: Tratar erro manualmente
try {
  const result = await someOperation()
  return result
} catch (error) {
  return reply.status(500).send({ message: "Erro" })
}
```

### **4. Logs estruturados**
```typescript
// ✅ BOM: Log estruturado
console.log("🚨 Erro capturado:", {
  error: error.message,
  url: request.url,
  method: request.method,
  timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
})

// ❌ RUIM: Log simples
console.log("Erro:", error.message)
```

## ✅ Checklist de Implementação

### **Antes de começar:**
- [ ] Projeto com Fastify configurado
- [ ] TypeScript configurado
- [ ] Zod instalado para validação

### **Passo a passo:**
- [ ] **Passo 1:** Criar `src/errors/client-error.ts`
- [ ] **Passo 2:** Instalar `dayjs` com `npm install dayjs`
- [ ] **Passo 3:** Criar `src/errors/error-handler.ts`
- [ ] **Passo 4:** Registrar no `src/server.ts` com `app.setErrorHandler()`
- [ ] **Passo 5:** Testar com erros nas rotas

### **Testes recomendados:**
- [ ] Erro de validação (dados inválidos)
- [ ] Erro customizado (`ClientError`)
- [ ] Erro interno (erro não tratado)
- [ ] Verificar logs no console
- [ ] Verificar respostas HTTP corretas

### **Estrutura de pastas final:**
```
src/
├── errors/
│   ├── client-error.ts      ✅
│   ├── error-handler.ts     ✅
│   └── README.md           ✅
├── routes/
│   └── ... (suas rotas)
└── server.ts               ✅ (com error handler registrado)
```

## 🎯 Como usar

### 1. **Erro de validação (ZodError)**
```typescript
// Automaticamente capturado pelo error handler
// Quando dados inválidos são enviados para a API
```

### 2. **Erro customizado (ClientError)**
```typescript
import { ClientError } from "../errors/client-error"

// Em qualquer rota
if (someCondition) {
  throw new ClientError("Mensagem de erro personalizada")
}
```

### 3. **Erro interno (qualquer outro erro)**
```typescript
// Automaticamente capturado como erro 500
// Com log detalhado para debug
```

## 📊 Respostas do Error Handler

### **Erro de validação (400)**
```json
{
  "message": "Dados inválidos",
  "errors": {
    "title": ["Título é obrigatório"],
    "unit_price": ["Preço deve ser maior que 0"]
  },
  "statusCode": 400
}
```

### **Erro customizado (400)**
```json
{
  "message": "Pagamento não encontrado",
  "statusCode": 400
}
```

### **Erro interno (500)**
```json
{
  "message": "Erro interno do servidor",
  "statusCode": 500
}
```

## 🐛 Logs de Debug

Todos os erros são logados no console com:
- Mensagem do erro
- Stack trace
- URL da requisição
- Método HTTP
- Timestamp formatado (usando dayjs)

### Exemplo de log:
```
🚨 Erro capturado: {
  error: "Pagamento não encontrado",
  stack: "Error: Pagamento não encontrado\n    at webhookRoute...",
  url: "/webhook",
  method: "POST",
  timestamp: "2024-01-15 10:30:00"
}
```
