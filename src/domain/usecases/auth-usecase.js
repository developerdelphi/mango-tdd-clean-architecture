const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (loadUserByEmailRepository, encripter, tokenGenerator) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encripter = encripter
    this.tokenGenerator = tokenGenerator
  }

  async auth (email, password) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    const user = await this.loadUserByEmailRepository.load(email)

    const isValid =
      user && (await this.encripter.compare(password, user.password))

    if (isValid) {
      const accessToken = await this.tokenGenerator.generate(user.id)
      return accessToken
    }

    return null
  }
}

module.exports = AuthUseCase
