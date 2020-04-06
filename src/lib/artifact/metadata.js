const fastXmlParser = require('fast-xml-parser')

const get = require('../get')
const url = require('./url')

const METADATA_FILENAME = 'maven-metadata.xml'

async function metadataForArtifact (repository, artifact) {
  const metadataPath = `${url.basepathForArtifact(repository.url, artifact)}/${METADATA_FILENAME}`

  const getOptions = get.basicAuthOptions(repository.username, repository.password)
  const metadataContents = await get.intoString(metadataPath, getOptions)

  return fastXmlParser.parse(metadataContents)
    .metadata
}

module.exports = {
  forArtifact: metadataForArtifact
}
