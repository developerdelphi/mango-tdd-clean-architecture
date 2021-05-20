module.exports = class InternalServerError extends Error {
  constructor (paramName) {
    super('Internal Error')
    this.name = 'InternalServerError'
  }
}
