const filename = require('./filename')
const parser = require('./parser')
const url = require('./url')
const version = require('./version')

const Artifact = {
  get filename () {
    return filename.forArtifact(this)
  },

  remotePath (repository) {
    return url.pathForArtifact(repository.url, this)
  },

  async updateVersionFromRepository (repository) {
    await version.remoteVersionForArtifact(repository, this)
  }
}

function artifactFromName (artifactName) {
  const artifact = parser.parseArtifactName(artifactName)

  Object.setPrototypeOf(artifact, Artifact)

  return artifact
}

module.exports = {
  fromName: artifactFromName,
  isArtifactName: parser.isArtifactName
}
