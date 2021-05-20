class EmailValidator {
  isValid (email) {
    return true
  }
}

describe('Email Validator', () => {
  it('Should return True if validator returns True', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('valid_email@email.com')
    expect(isEmailValid).toBe(true)
  })
})
