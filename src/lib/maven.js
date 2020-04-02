const mvnArtifactNameParser = require('mvn-artifact-name-parser').default
const mvnArtifactUrl = require('mvn-artifact-url').default
const mvnArtifactFilename = require('mvn-artifact-filename').default

function parseArtifactName (artifactName) {
  return mvnArtifactNameParser(artifactName)
}

function getArtifactUrlInRemoteRepository (artifact, repositoryUrl) {
  return mvnArtifactUrl(artifact, repositoryUrl)
}

function getArtifactFilename (artifact) {
  return mvnArtifactFilename(artifact)
}

module.exports = {
  parseArtifactName,
  getArtifactUrlInRemoteRepository,
  getArtifactFilename
}
