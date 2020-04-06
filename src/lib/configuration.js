const fs = require('fs')
const path = require('path')

const fastXmlParser = require('fast-xml-parser')

const emptyMvnxConfiguration = {
  servers: []
}

const emptyMvnSettings = {
  servers: []
}

const USERNAME_ENVIRONMENT_KEY = 'MVNX_REMOTE_USERNAME'
const PASSWORD_ENVIRONMENT_KEY = 'MVNX_REMOTE_PASSWORD'

const Configuration = {
  Configuration (mvnxConfiguration, mvnSettings, env) {
    this.mvnxConfiguration = mvnxConfiguration
    this.mvnSettings = mvnSettings
    this.env = env

    return this
  },

  getRemoteRepositoryConfiguration (repository) {
    const envCredentials = this._getCredentialsFromEnv()
    const mvnSettingsServer = this._getServerFromMvnSettings(repository)
    const mvnxConfServerById = this._getServerByIdFromMvnxConfiguration(repository)
    const mvnxConfServerByUrl = this._getServerByUrlFromMvnxConfiguration(repository)

    const credentials = Object.assign({},
      mvnxConfServerByUrl,
      mvnxConfServerById,
      mvnSettingsServer,
      envCredentials
    )

    const url = mvnxConfServerById.url || repository

    return {
      username: credentials.username,
      password: credentials.password,
      url
    }
  },

  _credentialsInEnv () {
    return this.env[USERNAME_ENVIRONMENT_KEY] && this.env[PASSWORD_ENVIRONMENT_KEY]
  },

  _credentialsFrom (username, password, url) {
    return {
      username, password, url
    }
  },

  _getCredentialsFromEnv () {
    return {
      username: this.env[USERNAME_ENVIRONMENT_KEY],
      password: this.env[PASSWORD_ENVIRONMENT_KEY]
    }
  },

  _getServerFromMvnSettings (id) {
    return this.mvnSettings.servers.find(s => s.id === id)
  },

  _getServerByIdFromMvnxConfiguration (id) {
    return this.mvnxConfiguration.servers.find(s => s.id === id)
  },

  _getServerByUrlFromMvnxConfiguration (url) {
    return this.mvnxConfiguration.servers.find(s => s.url === url)
  }
}

async function readMvnxConfiguration (baseDirectory) {
  let storedConfiguration
  try {
    storedConfiguration = await fs.promises.readFile(path.join(baseDirectory, 'mvnx.json'), { encoding: 'utf-8' })
  } catch {
    return emptyMvnxConfiguration
  }

  return JSON.parse(storedConfiguration)
}

async function readMvnSettings (baseDirectory) {
  let storedSettings
  try {
    storedSettings = await fs.promises.readFile(path.join(baseDirectory, 'settings.xml'), { encoding: 'utf-8' })
  } catch {
    return emptyMvnSettings
  }

  return fastXmlParser.parse(storedSettings)
}

async function readConfiguration (localRepositoryPath, env) {
  const mvnxConfiguration = readMvnxConfiguration(localRepositoryPath)
  const mvnSettings = readMvnSettings(localRepositoryPath)

  const configuration = Object.create(Configuration)
  return configuration.Configuration(mvnxConfiguration, mvnSettings, env)
}

module.exports = {
  read: readConfiguration
}
