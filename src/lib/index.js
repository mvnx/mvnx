const java = require('./java')
const log = require('./log')
const maven = require('./maven')

const LocalRepository = require('./repository/LocalRepository')
const RemoteRepository = require('./repository/RemoteRepository')

module.exports = {
  java: {
    executeJar: java.executeJar
  },
  log: {
    configure: log.configure
  },
  maven: {
    isArtifactName: maven.isArtifactName,
    obtainArtifact: maven.obtainArtifact
  },
  repository: {
    get defaultLocalRepositoryPath () {
      return LocalRepository.defaultPath()
    },
    get defaultRemoteRepositoryUrl () {
      return RemoteRepository.DEFAULT_REMOTE_REPOSITORY_URL
    }
  }
}
