const fs = require('fs')
const { homedir } = require('os')
const path = require('path')

const mkdirp = require('mkdirp')

const artifact = require('./artifact/artifact')
const configuration = require('./configuration')
const log = require('./log')
const get = require('./get')

const ArtifactNotFoundError = require('./error/ArtifactNotFoundError')
const InvalidArtifactError = require('./error/InvalidArtifactError')

function parseArtifactName (artifactName) {
  try {
    return artifact.fromName(artifactName)
  } catch {
    throw new InvalidArtifactError({ artifactName })
  }
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

  const config = await configuration.read(getLocalRepositoryPath(options.localRepository), process.env)
  const remoteRepositoryConfig = config.getRemoteRepositoryConfiguration(options.remoteRepository)

  if (options.useRemoteRepository && (artifact.isLatest || artifact.isSnapshot)) {
    await artifact.updateVersionFromRepository(remoteRepositoryConfig)
  }

  let localArtifactPath = null
  if (options.useLocalRepository) {
    if (!options.useRemoteRepository && (artifact.isLatest || artifact.isSnapshot)) {
      throw new Error('Latest and snapshot versions must be checked against a remote repository!')
    }

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
    remoteArtifactUrl = artifact.remotePath(remoteRepositoryConfig)

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
      const getOptions = get.basicAuthOptions(remoteRepositoryConfig.username, remoteRepositoryConfig.password)
      foundInRemoteRepository = await get.intoFile(remoteArtifactUrl, downloadedArtifactPath, getOptions)
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

module.exports = {
  obtainArtifact,
  probablyAnArtifactName: artifact.isArtifactName,
  getLocalRepositoryPath
}
