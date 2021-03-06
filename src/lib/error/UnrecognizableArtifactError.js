const BaseMvnxError = require('./BaseMvnxError')

class UnrecognizableArtifactError extends BaseMvnxError {
  constructor () {
    super('EUNRECOGNIZABLEARTIFACT', {})
  }

  get details () {
    return 'Failed to recognize the artifact argument.'
  }

  get solution () {
    return 'Try artifact names of the form\n\n  <groupId>:<artifactId>:<version>\n\nIf you\'re sure that the specified artifact name is correct, then please submit an issue to\n\n  https://github.com/mvnx/mvnx/issues'
  }
}

module.exports = UnrecognizableArtifactError
