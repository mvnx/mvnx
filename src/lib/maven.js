const { homedir } = require('os')
const path = require('path')

const mvnArtifactFilename = require('mvn-artifact-filename').default
const mvnArtifactNameParser = require('mvn-artifact-name-parser').default

function getArtifactFilename (artifact) {
  return mvnArtifactFilename(artifact)
}

function parseArtifactName (artifactName) {
  const artifact = mvnArtifactNameParser(artifactName)

  artifact.groupIdSegments = artifact.groupId.split('.')
  artifact.filename = getArtifactFilename(artifact)

  return artifact
}

function getLocalRepositoryPath (predefinedLocalRepository) {
  if (predefinedLocalRepository) {
    return predefinedLocalRepository
  }

  return path.join(homedir(), '.m2')
}

function getLocalArtifactPath (artifact, predefinedLocalRepository) {
  const localRepositoryPath = getLocalRepositoryPath(predefinedLocalRepository)

  const localArtifactPath = path.join(
    localRepositoryPath,
    'repository',
    ...artifact.groupIdSegments,
    artifact.version,
    artifact.filename
  )

  return localArtifactPath
}

async function obtainArtifact (options) {
  const artifact = parseArtifactName(options.artifactName)

  let localArtifactPath
  if (options.useLocalRepository) {
    localArtifactPath = getLocalArtifactPath(artifact, options.localRepository)

    console.log(localArtifactPath)
  }
}

module.exports = {
  obtainArtifact
}
