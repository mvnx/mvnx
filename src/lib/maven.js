const path = require('path')

const log = require('./log')
const fsUtil = require('./util/fs')

const Artifact = require('./artifact/artifact')
const Configuration = require('./configuration')
const LocalRepository = require('./repository/local-repository')
const RemoteRepository = require('./repository/remote-repository')

const ArtifactNotFoundError = require('./error/ArtifactNotFoundError')
const CannotCheckVersionInOnlyLocalError = require('./error/CannotCheckVersionInOnlyLocalError')

async function obtainArtifact (options) {
  let artifact = Artifact.fromName(options.artifactName)

  const localRepository = Object.create(LocalRepository).LocalRepository(options.localRepository)

  const config = await Configuration.read(localRepository.path, process.env)
  const remoteRepositoryConfig = config.getRemoteRepositoryConfiguration(options.remoteRepository)
  const remoteRepository = Object.create(RemoteRepository).RemoteRepository(
    remoteRepositoryConfig.url,
    remoteRepositoryConfig.username,
    remoteRepositoryConfig.password
  )

  if (options.useRemoteRepository && (artifact.latest || artifact.snapshot)) {
    artifact = await remoteRepository.artifactWithRemoteVersion(artifact)
  }

  let localArtifactPath = null
  if (options.useLocalRepository) {
    if (!artifact.version && !artifact.snapshotVersion) {
      throw new CannotCheckVersionInOnlyLocalError()
    }

    localArtifactPath = localRepository.pathToArtifact(artifact)

    log(`Searcing for artifact in the local repository at\n  ${localArtifactPath}`)

    if (await localRepository.artifactExistsInRepository(artifact)) {
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
    remoteArtifactUrl = remoteRepository.pathToArtifact(artifact)

    log(`Attempting to retrieve artifact from remote repository at\n  ${remoteArtifactUrl}`)

    let downloadedArtifactPath
    let temporary
    let firstCreatedDirectoryForDownload = null
    if (localArtifactPath) {
      firstCreatedDirectoryForDownload = await fsUtil.mkdirp(path.dirname(localArtifactPath))

      downloadedArtifactPath = localArtifactPath

      log(`Artifact will be saved to the local repository at\n ${localArtifactPath}`)

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
        await fsUtil.rmdirp(firstCreatedDirectoryForDownload, path.dirname(localArtifactPath))
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
  isArtifactName: Artifact.isArtifactName,
  DEFAULT_REMOTE_REPOSITORY_URL: RemoteRepository.DEFAULT_REMOTE_REPOSITORY_URL
}
