const filename = require('./filename')
const parser = require('./parser')

const Artifact = {
  get filename () {
    return filename.forArtifact(this)
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
