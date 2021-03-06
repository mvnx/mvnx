const BaseMvnxError = require('./BaseMvnxError')

class InvalidArtifactError extends BaseMvnxError {
  constructor (context) {
    super('EINVALIDARTIFACT', context)
  }

  get details () {
    return `Failed to parse the specified artifact "${this.context.artifactName}".`
  }

  get solution () {
    return 'Please check if you\'ve spelled the artifact correctly! Try artifact names of the form\n\n  <groupId>:<artifactId>:<version>\n\nIf you\'re sure that the specified artifact name is correct, then please submit an issue to\n\n  https://github.com/mvnx/mvnx/issues'
  }
}

module.exports = InvalidArtifactError
