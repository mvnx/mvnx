const EnvironmentConfiguration = require('./EnvironmentConfiguration')
const StoredMavenSettings = require('./StoredMavenSettings')
const StoredMvnxConfiguration = require('./StoredMvnxConfiguration')

const Configuration = {
  _deps: {
    EnvironmentConfiguration,
    StoredMavenSettings,
    StoredMvnxConfiguration
  },

  Configuration (env, maven, mvnx) {
    this._env = env
    this._maven = maven
    this._mvnx = mvnx

    return this
  },

  getRemoteRepositoryConfiguration (repository) {
    const envCredentials = {
      username: this._env.remoteUsername,
      password: this._env.remotePassword
    }

    const mavenServer = this._maven.getServerById(repository)
    if (mavenServer) {
      return {
        username: envCredentials.username,
        password: envCredentials.password,
        url: mavenServer.url
      }
    }

    const mvnxServerByUrl = this._mvnx.getServerByUrl(repository)
    if (mvnxServerByUrl) {
      return {
        username: envCredentials.username || mvnxServerByUrl.username,
        password: envCredentials.password || mvnxServerByUrl.password,
        url: mvnxServerByUrl.url
      }
    }

    const mvnxServerById = this._mvnx.getServerById(repository)
    if (mvnxServerById) {
      return {
        username: envCredentials.username || mvnxServerById.username,
        password: envCredentials.password || mvnxServerById.password,
        url: mvnxServerById.url
      }
    }

    const mvnxServerByPrefix = this._mvnx.getServerByPrefix(repository)
    if (mvnxServerByPrefix) {
      return {
        username: envCredentials.username || mvnxServerByPrefix.username,
        password: envCredentials.password || mvnxServerByPrefix.password,
        url: mvnxServerByPrefix.url
      }
    }

    return {
      username: envCredentials.username,
      password: envCredentials.password,
      url: repository
    }
  }
}

Configuration.read = async function read (localRepositoryPath) {
  const env = await this._deps.EnvironmentConfiguration.fromProcessEnv()
  const mvnx = await this._deps.StoredMvnxConfiguration.readFromDirectory(localRepositoryPath)
  const maven = await this._deps.StoredMavenSettings.readFromDirectory(localRepositoryPath)

  return Object.create(Configuration).Configuration(env, maven, mvnx)
}

module.exports = Configuration
