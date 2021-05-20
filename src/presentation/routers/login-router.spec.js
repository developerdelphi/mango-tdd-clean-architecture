const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const InternalServerError = require('../helpers/internal-server-error')
const InvalidParamError = require('../helpers/invalid-param-error')

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    constructor () {
      this.token = null
      this.email = null
      this.password = null
    }

    async auth (email, password) {
      this.email = email
      this.password = password
      return this.token
    }
  }
  return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  }

  return new AuthUseCaseSpy()
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    constructor () {
      this.isEmailValid = null
    }

    isValid (email) {
      return this.isEmailValid
    }
  }

  const emailValidator = new EmailValidatorSpy()
  emailValidator.isEmailValid = true

  return emailValidator
}

const makeSut = () => {
  const authUseCase = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  // Enviando um token para garantir o acesso
  authUseCase.token = 'valid_token'

  const sut = new LoginRouter(authUseCase, emailValidatorSpy)

  return {
    emailValidatorSpy,
    authUseCase,
    sut
  }
}

describe('Login Router', () => {
  test('Should return 400 if not email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if invalid email is provided', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    emailValidatorSpy.isEmailValid = false

    const httpRequest = {
      body: {
        email: 'invalid_email@.email.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 400 if not password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@.email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if not httpRequest is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if not httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      email: 'any_email@.email.com',
      password: 'any_password'
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should call AuthUseCase with correct params', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    await sut.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()

    authUseCase.token = null

    const httpRequest = {
      body: {
        email: 'invalid_email@.email.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'email@.email.com',
        password: 'password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.token).toEqual(authUseCase.token)
  })

  test('Should return 500 if not AuthUseCase is provided', async () => {
    const sut = new LoginRouter()

    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if AuthUseCase is not auth method', async () => {
    class AuthUseCaseSpy {}

    const authUseCase = new AuthUseCaseSpy()

    const sut = new LoginRouter(authUseCase)

    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if AuthUseCase return throw error', async () => {
    const authUseCase = makeAuthUseCaseWithError()

    const sut = new LoginRouter(authUseCase)

    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    // expect(httpResponse.body).toEqual(new InternalServerError())
  })
})
