const fs = require('fs')

const argv = require('./argv')
const Configuration = require('./configuration/Configuration')
const lib = require('../lib')

function makeObtainOptions (args, config) {
  const options = {
    artifactName: args.artifact
  }

  if (!args.ignoreLocal) {
    options.useLocalRepository = true
    options.localRepository = {
      path: args.localRepository
    }
  }

  if (!args.onlyLocal) {
    options.useRemoteRepository = true
    options.remoteRepository = config.getRemoteRepositoryConfiguration(args.remoteRepository)
  }

  return options
}

function makeExecuteOptions (artifactPath, args) {
  return {
    jar: artifactPath,
    arguments: args.arguments,
    javaExecutable: args.javaExecutable
  }
}

async function run (originalArgv) {
  const parsedArgv = argv.parse(originalArgv)

  lib.log.configure({ quiet: parsedArgv.quiet })

  const config = await Configuration.read(parsedArgv.localRepository)

  const obtainOptions = makeObtainOptions(parsedArgv, config)

  let obtainedArtifact
  try {
    obtainedArtifact = await lib.maven.obtainArtifact(obtainOptions)

    if (!obtainedArtifact) {
      process.exit(1)
    }

    const executeOptions = makeExecuteOptions(obtainedArtifact.path, parsedArgv)

    await lib.java.executeJar(executeOptions)
  } finally {
    if (obtainedArtifact && obtainedArtifact.temporary) {
      await fs.promises.unlink(obtainedArtifact.path)
    }
  }
}

module.exports = {
  run
}
