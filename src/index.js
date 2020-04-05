const fs = require('fs')

const yargs = require('yargs')

const java = require('./lib/java')
const log = require('./lib/log')
const maven = require('./lib/maven')

const UnrecognizableArtifactError = require('./lib/error/UnrecognizableArtifactError')

function splitArgv (originalArgv) {
  const artifactArgIndex = originalArgv.findIndex(maven.probablyAnArtifactName)

  if (artifactArgIndex === -1) {
    throw new UnrecognizableArtifactError()
  }

  return {
    cliArgv: originalArgv.slice(0, artifactArgIndex + 1),
    artifactArgv: originalArgv.slice(artifactArgIndex + 1)
  }
}

function justDisplayHelpOrVersion (originalArgv) {
  if (originalArgv.length === 2) {
    originalArgv.push('-h')
    return true
  }

  if (originalArgv.length === 3) {
    if (originalArgv[2] === '-h' || originalArgv[2] === '--help') {
      return true
    }

    if (originalArgv[2] === '-v' || originalArgv[2] === '--version') {
      return true
    }
  }

  return false
}

function retreiveVersion () {
  const packageJson = require('../package')

  return packageJson.version
}

function cli (originalArgv) {
  let split = null
  if (!justDisplayHelpOrVersion(originalArgv)) {
    split = splitArgv(originalArgv)
  }

  const yargsArgv = yargs(split ? split.cliArgv.slice(2) : originalArgv.slice(2))
    .usage('mvnx <groupid>:<artifactId>:<version>')
    .example('mvnx com.github.ricksbrown:cowsay:1.1.0 "Hello, World!"', 'Say hello with a friendly cow!')
    .epilogue('For more information, please visit https://github.com/mvnx/mvnx')
    .options({
      'ignore-local': {
        describe: 'Ignore pre-existing artifacts in the local repository and attempt to download the requested artifact from the remote repository.',
        type: 'boolean',
        conflicts: ['only-local']
      },
      'only-local': {
        describe: 'Attempt to find the requested artifact in the local repository only. Will not make requests to any remote repository.',
        type: 'boolean',
        conflicts: ['ignore-local']
      },
      'java-executable': {
        alias: 'j',
        describe: 'Custom java executable path and options.',
        type: 'string',
        default: 'java'
      },
      'local-repository': {
        alias: 'l',
        describe: 'Path to a local repository. Will attempt to use the default local repository ~/.m2 if missing',
        type: 'string'
      },
      'remote-repository': {
        alias: 'r',
        describe: 'URL of a remote repository. Will use Maven Central by default.',
        type: 'string',
        default: 'https://repo1.maven.org/maven2/'
      },
      quiet: {
        alias: 'q',
        describe: 'Suppress mvnx output (except for errors) and display output only from the JVM.',
        type: 'boolean'
      }
    })
    .help()
    .alias('help', 'h')
    .version(retreiveVersion())
    .alias('version', 'v')
    .strict(true)
    .argv

  yargsArgv.arguments = split.artifactArgv
  yargsArgv.artifact = yargsArgv._[0]

  return yargsArgv
}

function makeObtainOptionsFromArgv (argv) {
  const options = {
    artifactName: argv.artifact
  }

  if (!argv.ignoreLocal) {
    options.useLocalRepository = true
    options.localRepository = argv.localRepository
  }

  if (!argv.onlyLocal) {
    options.useRemoteRepository = true
    options.remoteRepository = argv.remoteRepository
  }

  return options
}

function makeExecuteOptions (artifactPath, argv) {
  return {
    jar: artifactPath,
    arguments: argv.arguments,
    javaExecutable: argv.javaExecutable
  }
}

async function run (originalArgv) {
  const parsedArgv = cli(originalArgv)

  log.configure({ quiet: parsedArgv.quiet })

  const obtainOptions = makeObtainOptionsFromArgv(parsedArgv)

  let obtainedArtifact
  try {
    obtainedArtifact = await maven.obtainArtifact(obtainOptions)

    if (!obtainedArtifact) {
      process.exit(1)
    }

    const executeOptions = makeExecuteOptions(obtainedArtifact.path, parsedArgv)

    await java.executeJar(executeOptions)
  } finally {
    if (obtainedArtifact && obtainedArtifact.temporary) {
      await fs.promises.unlink(obtainedArtifact.path)
    }
  }
}

module.exports = {
  run
}
