// 🚨 ERROR: Classe para erros customizados do cliente
export class ClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClientError'
  }
}
