const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncripter = () => {
  class EncrypterSpy {
    constructor () {
      this.password = null
      this.hashedPassword = null
      this.isValid = false
    }

    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true

  return encrypterSpy
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    constructor () {
      this.userId = null
      this.accessToken = null
    }

    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'

  return tokenGeneratorSpy
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    constructor () {
      this.user = null
    }

    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserByEmailRepository = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepository.user = { id: 'any_id', password: 'hashedPassword' }

  return loadUserByEmailRepository
}

const makeSut = () => {
  const encrypterSpy = makeEncripter()
  const tokenGeneratorSpy = makeTokenGenerator()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const sut = new AuthUseCase(
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy
  )

  return {
    sut,
    encrypterSpy,
    tokenGeneratorSpy,
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
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false

    const acessToken = await sut.auth(
      'valid_email@email.com',
      'invalid_password'
    )

    expect(acessToken).toBeNull()
  })

  it('Should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()

    await sut.auth('valid_email@email.com', 'any_password')

    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(
      loadUserByEmailRepositorySpy.user.password
    )
  })

  it('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  it('Should return accesToken if correct credentials has provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth(
      'valid_email@email.com',
      'valid_password'
    )

    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })
})
