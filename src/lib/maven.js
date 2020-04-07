const path = require('path')

const log = require('./log')
const fsUtil = require('./util/fs')

const Artifact = require('./artifact/artifact')
const LocalRepository = require('./repository/LocalRepository')
const RemoteRepository = require('./repository/RemoteRepository')

const ArtifactNotFoundError = require('./error/ArtifactNotFoundError')
const CannotCheckVersionInOnlyLocalError = require('./error/CannotCheckVersionInOnlyLocalError')

function shouldUpdateWithRemoteVersion (artifact, options) {
  return options.useRemoteRepository && (artifact.latest || artifact.snapshot)
}

async function retrieveArtifactWithExactVersion (options) {
  const baseArtifact = Artifact.fromName(options.artifactName)

  if (shouldUpdateWithRemoteVersion(baseArtifact, options)) {
    const remoteRepository = Object.create(RemoteRepository).RemoteRepository(
      options.remoteRepository.url,
      options.remoteRepository.username,
      options.remoteRepository.password
    )

    return remoteRepository.artifactWithRemoteVersion(baseArtifact)
  } else {
    return baseArtifact
  }
}

async function tryObtainLocally (options, artifact) {
  if (!artifact.version && !artifact.snapshotVersion) {
    throw new CannotCheckVersionInOnlyLocalError()
  }

  const localRepository = Object.create(LocalRepository).LocalRepository(options.localRepository.path)

  const localArtifactPath = localRepository.pathToArtifact(artifact)

  log(`Searcing for artifact in the local repository at\n  ${localArtifactPath}`)

  if (await localRepository.artifactExistsInRepository(artifact)) {
    log(`Artifact found in the local repository at\n  ${localArtifactPath}`)

    return {
      found: true,
      path: localArtifactPath,
      // But Mom, everything is temporary!
      // https://i.kym-cdn.com/photos/images/original/001/256/393/ad9.jpg
      temporary: false
    }
  } else {
    return {
      found: false,
      path: localArtifactPath
    }
  }
}

async function tryObtainRemotely (options, destination, artifact) {
  const remoteRepository = Object.create(RemoteRepository).RemoteRepository(
    options.remoteRepository.url,
    options.remoteRepository.username,
    options.remoteRepository.password
  )

  const remoteArtifactUrl = remoteRepository.pathToArtifact(artifact)

  log(`Attempting to retrieve artifact from remote repository at\n  ${remoteArtifactUrl}`)

  let downloadedArtifactPath
  let temporary
  let firstCreatedDirectoryForDownload = null
  if (destination) {
    firstCreatedDirectoryForDownload = await fsUtil.mkdirp(path.dirname(destination))

    downloadedArtifactPath = destination

    log(`Artifact will be saved to the local repository at\n ${destination}`)

    temporary = false
  } else {
    downloadedArtifactPath = artifact.filename

    temporary = true
  }

  let foundInRemoteRepository = null
  try {
    foundInRemoteRepository = await remoteRepository.downloadArtifact(artifact, downloadedArtifactPath)
  } finally {
    if (firstCreatedDirectoryForDownload && !foundInRemoteRepository) {
      await fsUtil.rmdirp(firstCreatedDirectoryForDownload, path.dirname(destination))
    }
  }

  if (foundInRemoteRepository) {
    log(`Retrieved artifact from remote repository\n  ${remoteArtifactUrl}`)

    return {
      found: true,
      url: remoteArtifactUrl,
      path: downloadedArtifactPath,
      temporary
    }
  } else {
    return {
      found: false,
      url: remoteArtifactUrl
    }
  }
}

async function obtainArtifact (options) {
  const artifact = await retrieveArtifactWithExactVersion(options)

  let localArtifactPath = null
  if (options.useLocalRepository) {
    const localObtainResult = await tryObtainLocally(options, artifact)

    localArtifactPath = localObtainResult.path

    if (localObtainResult.found) {
      return localObtainResult
    }
  }

  let remoteArtifactUrl = null
  if (options.useRemoteRepository) {
    const remoteObtainResult = await tryObtainRemotely(options, localArtifactPath, artifact)

    remoteArtifactUrl = remoteObtainResult.url

    if (remoteObtainResult.found) {
      return remoteObtainResult
    }
  }

  throw new ArtifactNotFoundError({
    artifactName: options.artifactName,
    localArtifactPath,
    remoteArtifactUrl
  })
}

module.exports = {
  isArtifactName: Artifact.isArtifactName,
  obtainArtifact
}
