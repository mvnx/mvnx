const fs = require('fs')
const os = require('os')
const path = require('path')

const LocalRepository = {
  defaultPath () {
    return path.join(this._deps.os.homedir(), '.m2')
  },

  _deps: {
    fs, os
  },

  LocalRepository (forcePath) {
    this._path = forcePath || this.defaultPath()

    return this
  },

  pathToArtifact (artifact) {
    const localArtifactPath = path.join(
      this.path,
      'repository',
      ...artifact.groupIdSegments,
      artifact.artifactId,
      artifact.version,
      artifact.filename
    )

    return localArtifactPath
  },

  async artifactExistsInRepository (artifact) {
    const artifactPath = this.pathToArtifact(artifact)

    try {
      await fs.promises.access(artifactPath, fs.constants.R_OK)

      return true
    } catch {
      // Do not use exceptions for control flow, lol.
      return false
    }
  },

  get path () {
    return this._path
  }
}

module.exports = LocalRepository
