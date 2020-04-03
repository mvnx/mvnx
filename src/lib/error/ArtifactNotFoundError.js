const BaseMvnxError = require('./BaseMvnxError')

class ArtifactNotFoundError extends BaseMvnxError {
  constructor (context) {
    super('EARTIFACTNOTFOUND', context)
  }

  get details () {
    let text = `Could not retrieve the aritfact "${this.context.artifactName}". Tried the following sources:`

    if (this.context.localArtifactPath) {
      text += `\n  * Local Path: ${this.context.localArtifactPath}`
    }

    if (this.context.remoteArtifactUrl) {
      text += `\n  * Remote URL: ${this.context.remoteArtifactUrl}`
    }

    return text
  }

  get solution () {
    return 'Please try the following options:\n' +
        '  * Check if you\'ve spelled the artifact correctly.\n' +
        '  * Check if the artifact is available in the local/remote repository.\n' +
        '  * Omit --ignore-local/--only-local.'
  }
}

module.exports = ArtifactNotFoundError
