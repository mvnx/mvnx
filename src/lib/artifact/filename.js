const DEFAULT_EXTENSION = 'jar'
const SNAPSHOT_SUFFIX = '-SNAPSHOT'

function formatVersion (artifact) {
  let suffix = ''
  if (artifact.snapshot) {
    if (artifact.snapshotVersion) {
      suffix = `-${artifact.snapshotVersion}`
    } else {
      suffix = SNAPSHOT_SUFFIX
    }
  }

  return `${artifact.version}${suffix}`
}

function filenameForArtifact (artifact) {
  const extension = artifact.extension || DEFAULT_EXTENSION

  const versionString = formatVersion(artifact)

  if (artifact.classifier) {
    return `${artifact.artifactId}-${versionString}-${artifact.classifier}.${extension}`
  }

  return `${artifact.artifactId}-${versionString}.${extension}`
}

module.exports = {
  forArtifact: filenameForArtifact
}
