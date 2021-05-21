const { MissingParamError } = require('../../utils/errors')
class AuthUseCase {
  async auth (email) {
    if (!email) throw new MissingParamError('email')
  }
}

describe('Auth UseCase', () => {
  it('Should throw if not email is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()

    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})
