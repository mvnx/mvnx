const EnvironmentConfiguration = require('./EnvironmentConfiguration')
const StoredMavenSettings = require('./StoredMavenSettings')
const StoredMvnxConfiguration = require('./StoredMvnxConfiguration')

function filterUndefined (obj) {
  const ret = {}

  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .forEach((key) => { ret[key] = obj[key] })

  return ret
}

function merge (...objs) {
  const normalized = objs
    .map(obj => obj || {})
    .map(filterUndefined)

  return Object.assign({}, ...normalized)
}

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
    const mvnxServerById = this._mvnx.getServerById(repository)
    const mvnxServerByUrl = this._mvnx.getServerByUrl(repository)

    const credentials = merge(
      mvnxServerByUrl,
      mvnxServerById,
      mavenServer,
      envCredentials
    )

    const url = mvnxServerById
      ? mvnxServerById.url
      : repository

    return {
      username: credentials.username,
      password: credentials.password,
      url
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
