const BaseMvnxError = require('./BaseMvnxError')

class CannotCheckVersionInOnlyLocalError extends BaseMvnxError {
  constructor () {
    super('ECANNOTCHECKVERSIONINONLYLOCAL')
  }

  get details () {
    return 'Could not get the latest or snapshot version because --only-local was set.'
  }

  get solution () {
    return 'Either omit the --only-local argument or specify a non-snapshot version for the artifact.'
  }
}

module.exports = CannotCheckVersionInOnlyLocalError
