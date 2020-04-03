const fs = require('fs')
const { homedir } = require('os')
const path = require('path')

const mkdirp = require('mkdirp')
const mvnArtifactFilename = require('mvn-artifact-filename').default
const mvnArtifactNameParser = require('mvn-artifact-name-parser').default
const mvnArtifactUrl = require('mvn-artifact-url').default

const download = require('./download')
const log = require('./log')

function getArtifactFilename (artifact) {
  return mvnArtifactFilename(artifact)
}

function parseArtifactName (artifactName) {
  const artifact = mvnArtifactNameParser(artifactName)

  artifact.groupIdSegments = artifact.groupId.split('.')
  artifact.filename = getArtifactFilename(artifact)

  return artifact
}

function getArtifactUrlInRemoteRepository (artifact, remoteRepository) {
  return mvnArtifactUrl(artifact, remoteRepository)
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
    artifact.artifactId,
    artifact.version,
    artifact.filename
  )

  return localArtifactPath
}

async function canReadLocalArtifact (path) {
  try {
    await fs.promises.access(path, fs.constants.R_OK)

    return true
  } catch (e) {
    // Do not use exceptions for control flow, lol.
    return false
  }
}

async function obtainArtifact (options) {
  const artifact = parseArtifactName(options.artifactName)

  let localArtifactPath = null
  if (options.useLocalRepository) {
    localArtifactPath = getLocalArtifactPath(artifact, options.localRepository)

    log(`Searcing for artifact in the local repository at\n  ${localArtifactPath}`)

    if (await canReadLocalArtifact(localArtifactPath)) {
      log(`Artifact found in the local repository at\n  ${localArtifactPath}`)

      return {
        path: localArtifactPath,
        // But Mom, everything is temporary!
        // https://i.kym-cdn.com/photos/images/original/001/256/393/ad9.jpg
        temporary: false
      }
    }
  }

  if (options.useRemoteRepository) {
    const remoteArtifactUrl = await getArtifactUrlInRemoteRepository(artifact, options.remoteRepository)

    log(`Attempting to retrieve artifact from remote repository at\n  ${remoteArtifactUrl}`)

    let downloadedArtifactPath
    let temporary
    if (localArtifactPath) {
      await mkdirp(path.dirname(localArtifactPath))

      downloadedArtifactPath = localArtifactPath

      log(`Downloaded artifact will be saved to the local repository at\n ${localArtifactPath}`)

      temporary = false
    } else {
      downloadedArtifactPath = artifact.filename

      temporary = true
    }

    await download(remoteArtifactUrl, downloadedArtifactPath)

    log(`Retrieved artifact from remote repository\n  ${remoteArtifactUrl}`)

    return {
      path: downloadedArtifactPath,
      temporary
    }
  }

  return null
}

const ARTIFACT_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_:.-]*?[a-zA-Z0-9]$/g

function probablyAnArtifactName (str) {
  const regexMatches = str.match(ARTIFACT_NAME_REGEX)

  if (!regexMatches) {
    return false
  }

  return str.split(':').length >= 3
}

module.exports = {
  obtainArtifact,
  probablyAnArtifactName
}
