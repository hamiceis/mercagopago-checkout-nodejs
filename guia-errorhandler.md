# 🚨 Guia Completo: Error Handler para Fastify

Este guia mostra como implementar um sistema completo de tratamento de erros em aplicações Fastify com TypeScript.

## 📋 Resumo Rápido

### **O que você vai aprender:**
- ✅ Como criar classes de erro customizadas
- ✅ Como implementar error handler global
- ✅ Como tratar diferentes tipos de erro
- ✅ Como fazer logs estruturados
- ✅ Boas práticas e dicas

## 🛠️ Implementação (5 Passos)

### **1️⃣ Criar classe ClientError**
```typescript
// src/errors/client-error.ts
export class ClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClientError'
  }
}
```

### **2️⃣ Instalar dependências**
```bash
npm install dayjs  # Para timestamps formatados
```

### **3️⃣ Criar Error Handler Global**
```typescript
// src/errors/error-handler.ts
import { FastifyInstance } from "fastify"
import { ClientError } from "./client-error"
import { ZodError } from "zod"
import dayjs from "dayjs"

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // Log estruturado
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

### **4️⃣ Registrar no servidor**
```typescript
// src/server.ts
import { errorHandler } from "./errors/error-handler"

const app = Fastify()
app.setErrorHandler(errorHandler)
```

### **5️⃣ Usar nas rotas**
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

## 🎯 Tipos de Erro Tratados

### **1. Erro de Validação (ZodError) - 400**
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

### **2. Erro Customizado (ClientError) - 400**
```json
{
  "message": "Pagamento não encontrado",
  "statusCode": 400
}
```

### **3. Erro Interno (Qualquer outro) - 500**
```json
{
  "message": "Erro interno do servidor",
  "statusCode": 500
}
```

## 💡 Boas Práticas

### **✅ Ordem de verificação (do específico para o genérico):**
1. `ZodError` (validação)
2. `ClientError` (erro do cliente)
3. Erro genérico (500)

### **✅ Try/catch correto:**
```typescript
// ✅ BOM: Deixar o error handler capturar
try {
  const result = await someOperation()
  return result
} catch (error) {
  throw error  // Re-throw para o error handler global
}

// ❌ RUIM: Tratar erro manualmente
try {
  const result = await someOperation()
  return result
} catch (error) {
  return reply.status(500).send({ message: "Erro" })
}
```

### **✅ Logs estruturados:**
```typescript
console.log("🚨 Erro capturado:", {
  error: error.message,
  url: request.url,
  method: request.method,
  timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
})
```

## 🧪 Como Testar

### **1. Erro de validação:**
```bash
curl -X POST http://localhost:3333/payments \
  -H "Content-Type: application/json" \
  -d '{"title": "", "unit_price": -10}'
```

### **2. Erro customizado:**
```typescript
// Em qualquer rota
throw new ClientError("Teste de erro customizado")
```

### **3. Erro interno:**
```typescript
// Em qualquer rota
throw new Error("Teste de erro interno")
```

## 📁 Estrutura de Arquivos

```
src/
├── errors/
│   ├── client-error.ts      # Classe para erros customizados
│   ├── error-handler.ts     # Error handler global
│   └── README.md           # Guia detalhado
├── routes/
│   └── ... (suas rotas)
└── server.ts               # Servidor com error handler registrado
```

## ✅ Checklist de Implementação

- [ ] **Passo 1:** Criar `src/errors/client-error.ts`
- [ ] **Passo 2:** Instalar `dayjs` com `npm install dayjs`
- [ ] **Passo 3:** Criar `src/errors/error-handler.ts`
- [ ] **Passo 4:** Registrar no `src/server.ts` com `app.setErrorHandler()`
- [ ] **Passo 5:** Testar com erros nas rotas

## 🎯 Vantagens do Sistema

- ✅ **Centralizado:** Todos os erros passam pelo mesmo handler
- ✅ **Consistente:** Respostas padronizadas para cada tipo de erro
- ✅ **Debug:** Logs detalhados para facilitar desenvolvimento
- ✅ **Flexível:** Fácil de adicionar novos tipos de erro
- ✅ **Type-safe:** Com TypeScript e validação Zod
- ✅ **Profissional:** Sistema robusto e escalável

## 📚 Documentação Completa

Para mais detalhes, exemplos avançados e dicas extras, consulte:
- `src/errors/README.md` - Guia completo e detalhado

---

**🚀 Agora você tem um sistema profissional de tratamento de erros!**
