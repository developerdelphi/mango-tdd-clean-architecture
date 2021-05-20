const HttpResponse = require('../helpers/http-response')

class LoginRouter {
  constructor (authUseCase) {
    this.authUseCase = authUseCase
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body
      if (!email) {
        return HttpResponse.badRequest('email')
      }
      if (!password) {
        return HttpResponse.badRequest('password')
      }

      const token = await this.authUseCase.auth(email, password)

      if (!token) return HttpResponse.unauthorizedError()

      return HttpResponse.ok({ token })
    } catch (error) {
      /**
       * Nesta situação o error não está sendo tratado pelo sistema
       * o correto é enviar para um arquivo de log do sistema ou deixar o console
       * neste caso removido para não poluir o test
       */
      // console.error(error)
      return HttpResponse.serverError()
    }
  }
}

module.exports = LoginRouter
