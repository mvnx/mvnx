const fs = require('fs')
const path = require('path')

const fastXmlParser = require('fast-xml-parser')

const EMPTY_CONFIGURATION = {
  servers: []
}

const StoredMavenSettings = {
  _deps: {
    fs,
    fastXmlParser
  },

  StoredMavenSettings (data) {
    this._data = data

    return this
  },

  getServerById (id) {
    return this.data.servers.find(s => s.id === id)
  }
}

StoredMavenSettings._readSettingsFile = async function _readSettingsFile (file) {
  try {
    const storedSettings = await this._deps.fs.promises.readFile(file, { encoding: 'utf-8' })

    return this._deps.fastXmlParser.parse(storedSettings)
  } catch {
    return EMPTY_CONFIGURATION
  }
}

StoredMavenSettings.readFromDirectory = async function readFromDirectory (directory) {
  const file = path.join(directory, 'settings.xml')

  const contents = await this._readSettingsFile(file)

  return Object.create(StoredMavenSettings).StoredMavenSettings(contents)
}

module.exports = StoredMavenSettings
