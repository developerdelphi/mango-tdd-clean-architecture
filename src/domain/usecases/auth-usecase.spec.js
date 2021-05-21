const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    constructor () {
      this.user = null
    }

    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = {}
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)

  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('Auth UseCase', () => {
  it('Should throw if not email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()

    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  it('Should throw if not password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@email.com')

    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  it('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'any_password')

    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })

  it('Should thrown if not loadUserByEmailRepository is not provided', async () => {
    const sut = new AuthUseCase()

    const promise = sut.auth('any_email@email.com', 'any_password')

    expect(promise).rejects.toThrow()
  })

  it('Should thrown if loadUserByEmailRepository load method has not provided', async () => {
    const sut = new AuthUseCase({})

    const promise = sut.auth('any_email@email.com', 'any_password')

    expect(promise).rejects.toThrow()
  })

  it('Should return null if an invalid email has provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()

    loadUserByEmailRepositorySpy.user = null

    const acessToken = await sut.auth('invalid_email@email.com', 'any_password')

    expect(acessToken).toBeNull()
  })

  it('Should return null if an invalid password has provided', async () => {
    const { sut } = makeSut()

    const acessToken = await sut.auth(
      'valid_email@email.com',
      'invalid_password'
    )

    expect(acessToken).toBeNull()
  })
})
