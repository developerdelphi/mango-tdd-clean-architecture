const validator = require('validator')
class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

describe('Email Validator', () => {
  it('Should return True if validator returns True', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('valid_email@email.com')
    expect(isEmailValid).toBe(true)
  })

  it('Should return False if validator returns false', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('invalid_emailemail.com')
    expect(isEmailValid).toBe(false)
  })
})
