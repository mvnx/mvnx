const fs = require('fs')
const { homedir } = require('os')
const path = require('path')

const mkdirp = require('mkdirp')
const mvnArtifactFilename = require('mvn-artifact-filename').default
const mvnArtifactUrl = require('mvn-artifact-url').default

const artifactParser = require('./artifact-parser')
const log = require('./log')
const get = require('./get')

const ArtifactNotFoundError = require('./error/ArtifactNotFoundError')
const InvalidArtifactError = require('./error/InvalidArtifactError')

function getArtifactFilename (artifact) {
  return mvnArtifactFilename(artifact)
}

function parseArtifactName (artifactName) {
  try {
    const artifact = artifactParser.parseArtifactName(artifactName)

    artifact.groupIdSegments = artifact.groupId.split('.')
    artifact.filename = getArtifactFilename(artifact)

    return artifact
  } catch {
    throw new InvalidArtifactError({ artifactName })
  }
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

async function rmdirp (from, to) {
  const fromSegments = from.split(path.sep)
  const toSegments = to.split(path.sep)
    .slice(fromSegments.length)

  for (let i = toSegments.length; i >= 0; --i) {
    const deletePath = path.join(...fromSegments, ...toSegments.slice(0, i))

    await fs.promises.rmdir(deletePath)
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

  let remoteArtifactUrl = null
  if (options.useRemoteRepository) {
    remoteArtifactUrl = await getArtifactUrlInRemoteRepository(artifact, options.remoteRepository)

    log(`Attempting to retrieve artifact from remote repository at\n  ${remoteArtifactUrl}`)

    let downloadedArtifactPath
    let temporary
    let firstCreatedDirectoryForDownload = null
    if (localArtifactPath) {
      firstCreatedDirectoryForDownload = await mkdirp(path.dirname(localArtifactPath))

      downloadedArtifactPath = localArtifactPath

      log(`Artifact will be saved to the local repository at\n ${localArtifactPath}`)

      temporary = false
    } else {
      downloadedArtifactPath = artifact.filename

      temporary = true
    }

    let foundInRemoteRepository = null
    try {
      foundInRemoteRepository = await get.intoFile(remoteArtifactUrl, downloadedArtifactPath)
    } finally {
      if (firstCreatedDirectoryForDownload && !foundInRemoteRepository) {
        await rmdirp(firstCreatedDirectoryForDownload, path.dirname(localArtifactPath))
      }
    }

    if (foundInRemoteRepository) {
      log(`Retrieved artifact from remote repository\n  ${remoteArtifactUrl}`)

      return {
        path: downloadedArtifactPath,
        temporary
      }
    }
  }

  throw new ArtifactNotFoundError({
    artifactName: options.artifactName,
    localArtifactPath,
    remoteArtifactUrl
  })
}

function probablyAnArtifactName (str) {
  return artifactParser.isArtifactName(str)
}

module.exports = {
  obtainArtifact,
  probablyAnArtifactName,
  getLocalRepositoryPath
}
