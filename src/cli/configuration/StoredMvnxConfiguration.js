const fs = require('fs')
const path = require('path')

const EMPTY_CONFIGURATION = {
  servers: []
}

const StoredMvnxConfiguration = {
  _deps: {
    fs
  },

  StoredMvnxConfiguration (data) {
    this._data = data

    return this
  },

  getServerById (id) {
    return (this._data.servers || []).find(s => s.id === id)
  },

  getServerByUrl (url) {
    return (this._data.servers || []).find(s => s.url === url)
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
