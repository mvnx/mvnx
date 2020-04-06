const fastXmlParser = require('fast-xml-parser')

const get = require('../get')

const Artifact = require('../artifact/artifact')

const METADATA_FILENAME = 'maven-metadata.xml'
const MAVEN_CENTRAL_REPOSITORY_URL = 'https://repo1.maven.org/maven2'

function copyArtifact (originalProps, newProps) {
  const artifactObj = {}

  Object.keys(originalProps)
    .forEach(key => { artifactObj[key.slice(1)] = originalProps[key] })

  Object.keys(newProps)
    .forEach(key => { artifactObj[key] = newProps[key] })

  return Object.create(Artifact).Artifact(artifactObj)
}

const RemoteRepository = {
  DEFAULT_REMOTE_REPOSITORY_URL: MAVEN_CENTRAL_REPOSITORY_URL,

  _deps: {
    fastXmlParser,
    get
  },

  RemoteRepository (url, username, password) {
    this._url = url || this.DEFAULT_REMOTE_REPOSITORY_URL
    this._username = username
    this._password = password

    return this
  },

  basepathToArtifact (artifact) {
    return `${this.url}/${artifact.groupIdSegments.join('/')}/${artifact.artifactId}`
  },

  pathToArtifact (artifact) {
    return `${this.basepathForArtifact(this.url, artifact)}/${artifact.version}/${artifact.filename}`
  },

  async metadataForArtifact (artifact) {
    const metadataPath = `${this.basepathToArtifact(artifact)}/${METADATA_FILENAME}`

    const getOptions = this._deps.get.basicAuthOptions(this.username, this.password)
    const metadataContents = await this._deps.get.intoString(metadataPath, getOptions)

    return this._deps.fastXmlParser.parse(metadataContents)
      .metadata
  },

  async artifactWithRemoteVersion (artifact) {
    if (artifact.latest || artifact.snapshot) {
      const mt = await this.metadataForArtifact(artifact)

      if (artifact.snapshot) {
        const snapshot = mt.versioning.snapshot

        const snapshotVersion = `${snapshot.timestamp}-${snapshot.buildNumber}`

        return copyArtifact(artifact, { snapshotVersion })
      } else if (artifact.latest) {
        const version = mt.versioning.latest

        return copyArtifact(artifact, { version })
      }
    } else {
      return artifact
    }
  },

  forgetCredentials () {
    delete this._username
    delete this._password
  },

  get url () {
    return this._url
  },

  get username () {
    return this._username
  },

  get password () {
    return this._password
  }
}

module.exports = RemoteRepository
