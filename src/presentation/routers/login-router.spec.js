const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')

class AuthUseCaseSpy {
  auth (email, password) {
    this.email = email
    this.password = password
  }
}

const makeSut = () => {
  const authUseCase = new AuthUseCaseSpy()

  const sut = new LoginRouter(authUseCase)

  return {
    authUseCase,
    sut
  }
}

describe('Login Router', () => {
  test('Should return 400 if not email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if not password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@.email.com'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if not httpRequest is provided', () => {
    const { sut } = makeSut()

    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if not httpRequest has no body', () => {
    const { sut } = makeSut()
    const httpRequest = {
      email: 'any_email@.email.com',
      password: 'any_password'
    }

    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should call AuthUseCase with correct params', () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    sut.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'invalid_email@.email.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 500 if not AuthUseCase is provided', () => {
    const sut = new LoginRouter()

    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if AuthUseCase is not auth method', () => {
    class AuthUseCaseSpy {
      // auth (email, password) {
      //   this.email = email
      //   this.password = password
      // }
    }

    const authUseCase = new AuthUseCaseSpy()

    const sut = new LoginRouter(authUseCase)

    const httpRequest = {
      body: {
        email: 'any_email@.email.com',
        password: 'any_password'
      }
    }

    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
