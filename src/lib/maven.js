const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')

const log = require('./log')
const get = require('./get')

const Artifact = require('./artifact/artifact')
const Configuration = require('./configuration')
const LocalRepository = require('./repository/local-repository')
const RemoteRepository = require('./repository/remote-repository')

const ArtifactNotFoundError = require('./error/ArtifactNotFoundError')

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
      throw new Error('Latest and snapshot versions must be checked against a remote repository!')
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
      const getOptions = get.basicAuthOptions(remoteRepository.username, remoteRepository.password)
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
  isArtifactName: Artifact.isArtifactName,
  DEFAULT_REMOTE_REPOSITORY_URL: RemoteRepository.DEFAULT_REMOTE_REPOSITORY_URL
}
