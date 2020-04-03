const BaseMvnxError = require('./BaseMvnxError')

class JavaNotFoundError extends BaseMvnxError {
  constructor (context, cause) {
    super('EJAVANOTFOUNDERROR', context, cause)
  }

  get details () {
    return `Failed to run Java executable:\n\n  ${this.context.executable}`
  }

  get solution () {
    return 'Check if the JRE is installed and the java executable is available on the path.'
  }
}

module.exports = JavaNotFoundError
