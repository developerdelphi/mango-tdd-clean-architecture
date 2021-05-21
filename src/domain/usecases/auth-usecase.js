const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (args = {}) {
    this.loadUserByEmailRepository = args.loadUserByEmailRepository
    this.encrypter = args.encrypter
    this.tokenGenerator = args.tokenGenerator
  }

  async auth (email, password) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    const user = await this.loadUserByEmailRepository.load(email)

    const isValid =
      user && (await this.encrypter.compare(password, user.password))

    if (isValid) {
      const accessToken = await this.tokenGenerator.generate(user.id)
      return accessToken
    }

    return null
  }
}

module.exports = AuthUseCase
