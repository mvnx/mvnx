const { URL } = require('url')

const ARTIFACT_SEGMENT_SEPARATOR = ':'
const ARTIFACT_SEGMENT_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-_.][a-zA-Z0-9]|[a-zA-Z0-9])*$/g

const REPOSITORY_IDENTIFIER_SEGMENT_REGEX = /^[a-zA-Z0-9-_.]+$/g

const GROUP_ID_SEGMENT_SEPARATOR = '.'
const URL_SEPARATOR = '/'

const MIN_SEGMENT_COUNT = 2
const MAX_SEGMENT_COUNT = 5

const SNAPSHOT_SUFFIX = '-SNAPSHOT'

function nameIncludesRepository (name) {
  return name.includes(URL_SEPARATOR)
}

function isValidUrl (repository) {
  try {
    // Will throw TypeError if repository is not a valid URL.
    // Not the most elegant way to check the validity but it's okay.
    new URL(repository) // eslint-disable-line no-new

    return true
  } catch (e) {
    return false
  }
}

function isValidRepositoryIdentifier (repository) {
  const segments = repository.split(URL_SEPARATOR)

  return segments.every(segment => segment.match(REPOSITORY_IDENTIFIER_SEGMENT_REGEX) !== null)
}

function isArtifactName (name = '') {
  if (nameIncludesRepository(name)) {
    const isValidRepositoryPart = isValidUrl(name) || isValidRepositoryIdentifier(name)

    if (!isValidRepositoryPart) {
      return false
    }
  }

  const segments = name.split(ARTIFACT_SEGMENT_SEPARATOR)

  if (segments.length < MIN_SEGMENT_COUNT || segments.length > MAX_SEGMENT_COUNT) {
    return false
  }

  return segments.every(segment => segment.match(ARTIFACT_SEGMENT_REGEX) !== null)
}

function parseArtifactName (name) {
  if (!isArtifactName(name)) {
    throw new Error(`${name} is not a valid maven artifact name!`)
  }

  const segments = name.split(ARTIFACT_SEGMENT_SEPARATOR)
  const segmentCount = segments.length

  const artifact = {
    groupId: segments[0],
    groupIdSegments: segments[0].split(GROUP_ID_SEGMENT_SEPARATOR),
    artifactId: segments[1],
    extension: segmentCount > 3 ? segments[2] : null,
    classifier: segmentCount > 4 ? segments[3] : null,
    segments
  }

  if (segmentCount === MIN_SEGMENT_COUNT) {
    artifact.latest = true
  } else {
    artifact.version = segments[segmentCount - 1]

    if (artifact.version.endsWith(SNAPSHOT_SUFFIX)) {
      artifact.snapshot = true

      artifact.version = artifact.version.substr(0, artifact.version.indexOf(SNAPSHOT_SUFFIX))
    }
  }

  return artifact
}

module.exports = {
  isArtifactName,
  parseArtifactName
}
