const metadata = require('./metadata')

async function remoteVersionForArtifact (repository, artifact) {
  if (artifact.isLatest || artifact.isSnapshot) {
    const mt = await metadata.forArtifact(repository, artifact)

    if (artifact.isSnapshot) {
      const snapshot = mt.versioning.snapshot

      artifact.snapshotVersion = `${snapshot.timestamp}-${snapshot.buildNumber}`
    } else if (artifact.isLatest) {
      artifact.version = mt.versioning.latest
    }
  }
}

module.exports = {
  remoteVersionForArtifact
}
