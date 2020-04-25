const fs = require('fs')
const path = require('path')

const EMPTY_CONFIGURATION = {
  servers: []
}

const PREFIX_SEPARATOR = '/'

const StoredMvnxConfiguration = {
  _deps: {
    fs
  },

  StoredMvnxConfiguration (data) {
    this._data = data

    return this
  },

  getServerByPrefix (repositoryPart) {
    const splitRepositoryPath = this._splitAtPrefix(repositoryPart)

    if (!splitRepositoryPath) {
      return null
    }

    const server = (this._data.servers || [])
      .filter(s => s.isPrefix)
      .find(s => s.id === splitRepositoryPath.prefix)

    if (!server) {
      return null
    }

    return {
      username: server.username,
      password: server.password,
      url: server.url.replace('$$', splitRepositoryPath.substitute)
    }
  },

  getServerById (id) {
    return (this._data.servers || [])
      .filter(s => !s.isPrefix)
      .find(s => s.id === id)
  },

  getServerByUrl (url) {
    return (this._data.servers || [])
      .filter(s => !s.isPrefix)
      .find(s => s.url === url)
  },

  _splitAtPrefix (str) {
    const prefixSeparatorIndex = str.indexOf(PREFIX_SEPARATOR)

    return (prefixSeparatorIndex === -1)
      ? null
      : { prefix: str.substring(0, prefixSeparatorIndex), substitute: str.substring(prefixSeparatorIndex + 1) }
  }
}

StoredMvnxConfiguration._readConfigurationFile = async function _readConfigurationFile (file) {
  try {
    const storedConfiguration = await this._deps.fs.promises.readFile(file, { encoding: 'utf-8' })

    return JSON.parse(storedConfiguration)
  } catch {
    return EMPTY_CONFIGURATION
  }
}

StoredMvnxConfiguration.readFromDirectory = async function readFromDirectory (directory) {
  const file = path.join(directory, 'mvnx.json')

  const contents = await this._readConfigurationFile(file)

  return Object.create(StoredMvnxConfiguration).StoredMvnxConfiguration(contents)
}

module.exports = StoredMvnxConfiguration
