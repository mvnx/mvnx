function basepathForArtifact (repositoryUrl, artifact) {
  return `${repositoryUrl}/${artifact.groupIdSegments.join('/')}/${artifact.artifactId}`
}

function pathForArtifact (repositoryUrl, artifact) {
  return `${basepathForArtifact(repositoryUrl, artifact)}/${artifact.version}/${artifact.filename}`
}

module.exports = {
  basepathForArtifact,
  pathForArtifact
}
