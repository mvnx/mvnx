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

function cli (originalArgv) {
  const { cliArgv, artifactArgv } = splitArgv(originalArgv)

  const yargsArgv = yargs(cliArgv.slice(2))
    .options({
      'ignore-local': {
        describe: '',
        type: 'boolean',
        conflicts: ['only-local']
      },
      'only-local': {
        describe: '',
        type: 'boolean',
        conflicts: ['ignore-local']
      },
      'java-executable': {
        alias: 'j',
        describe: '',
        type: 'string',
        default: 'java'
      },
      'local-repository': {
        alias: 'l',
        describe: '',
        type: 'string'
      },
      'remote-repository': {
        alias: 'r',
        describe: '',
        type: 'string',
        default: 'https://repo1.maven.org/maven2/'
      },
      quiet: {
        alias: 'q',
        describe: '',
        type: 'boolean'
      }
    })
    .command('$0 <artifact>')
    .version()
    .alias('version', 'v')
    .help()
    .alias('help', 'h')
    .strict(true)
    .argv

  yargsArgv.arguments = artifactArgv

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
