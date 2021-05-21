const HttpResponse = require('../helpers/http-response')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')

class LoginRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return HttpResponse.badRequest(new MissingParamError('email'))
      }

      if (!this.emailValidator.isValid(email)) {
        return HttpResponse.badRequest(new InvalidParamError('email'))
      }

      if (!password) {
        return HttpResponse.badRequest(new MissingParamError('password'))
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
