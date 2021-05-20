module.exports = class InvalidParamError extends Error {
  constructor (paramName) {
    super(`Param name ${paramName} is Invalid`)
    this.name = 'InvalidParamError'
  }
}
