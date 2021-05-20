module.exports = class MissingParamError extends Error {
  constructor (paramName) {
    super(`Param name ${paramName} not found in body request`)
    this.name = 'MissingParamError'
  }
}
