const filename = require('./filename')
const parser = require('./parser')

function artifactFromName (artifactName) {
  const artifact = parser.parseArtifactName(artifactName)

  artifact.filename = filename.forArtifact(artifact)

  return artifact
}

module.exports = {
  fromName: artifactFromName,
  isArtifactName: parser.isArtifactName
}
