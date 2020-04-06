const fastXmlParser = require('fast-xml-parser')

const get = require('../get')

const METADATA_FILENAME = 'maven-metadata.xml'
const MAVEN_CENTRAL_REPOSITORY_URL = 'https://repo1.maven.org/maven2'

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

  async versionForArtifact (artifact) {
    if (artifact.isLatest || artifact.isSnapshot) {
      const mt = await this.metadataForArtifact(artifact)

      if (artifact.isSnapshot) {
        const snapshot = mt.versioning.snapshot

        artifact.snapshotVersion = `${snapshot.timestamp}-${snapshot.buildNumber}`
      } else if (artifact.isLatest) {
        artifact.version = mt.versioning.latest
      }
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
