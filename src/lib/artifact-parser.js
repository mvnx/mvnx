const ARTIFACT_SEGMENT_SEPARATOR = ':'
const ARTIFACT_SEGMENT_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-_.][a-zA-Z0-9]|[a-zA-Z0-9])*$/g

const MIN_SEGMENT_COUNT = 2
const MAX_SEGMENT_COUNT = 5

const SNAPSHOT_SUFFIX = '-SNAPSHOT'

function isArtifactName (name) {
  const segments = name.split(ARTIFACT_SEGMENT_SEPARATOR)

  console.log(segments)

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
    artifactId: segments[1],
    extension: segmentCount > 3 ? segments[2] : null,
    classifier: segmentCount > 4 ? segments[3] : null
  }

  if (segmentCount === MIN_SEGMENT_COUNT) {
    artifact.isLatest = true
  } else {
    artifact.version = segments[segmentCount - 1]

    if (artifact.version.endsWith(SNAPSHOT_SUFFIX)) {
      artifact.isSnapshot = true

      artifact.version = artifact.version.substr(0, artifact.version.indexOf(SNAPSHOT_SUFFIX))
    }
  }

  return artifact
}

module.exports = {
  isArtifactName,
  parseArtifactName
}
