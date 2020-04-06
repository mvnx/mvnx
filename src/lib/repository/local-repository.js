const fs = require('fs')
const os = require('os')
const path = require('path')

const LocalRepository = {
  _deps: {
    fs, os
  },

  LocalRepository (path) {
    this._path = path || path.join(this._deps.os.homedir(), '.m2')
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
    } catch (e) {
      // Do not use exceptions for control flow, lol.
      return false
    }
  },

  get path () {
    return this._path
  }
}

module.exports = LocalRepository
