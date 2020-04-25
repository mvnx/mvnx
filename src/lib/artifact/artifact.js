const filename = require('./filename')
const parser = require('./parser')

const InvalidArtifactError = require('../error/InvalidArtifactError')

const Artifact = {
  Artifact (obj) {
    Object.keys(obj).forEach(key => { this['_' + key] = obj[key] })

    return this
  },

  get repository () {
    return this._repository
  },

  get groupId () {
    return this._groupId
  },

  get groupIdSegments () {
    return this._groupIdSegments
  },

  get artifactId () {
    return this._artifactId
  },

  get extension () {
    return this._extension
  },

  get classifier () {
    return this._classifier
  },

  get version () {
    return this._version
  },

  get snapshot () {
    return this._snapshot
  },

  get snapshotVersion () {
    return this._snapshotVersion
  },

  get latest () {
    return this._latest
  },

  get filename () {
    return filename.forArtifact(this)
  }
}

Artifact.isArtifactName = parser.isArtifactName

Artifact.fromName = function fromName (artifactName) {
  try {
    const artifactObj = parser.parseArtifactName(artifactName)

    return Object.create(Artifact).Artifact(artifactObj)
  } catch {
    throw new InvalidArtifactError({ artifactName })
  }
}

module.exports = Artifact
