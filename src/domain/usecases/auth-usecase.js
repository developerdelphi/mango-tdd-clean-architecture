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

    if (!user) return null

    const isValid = await this.encripter.compare(password, user.password)
    if (!isValid) return null
    const accessToken = await this.tokenGenerator.generate(user.id)
    return accessToken
  }
}

module.exports = AuthUseCase
