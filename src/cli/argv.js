const yargs = require('yargs')

const lib = require('../lib')

const UnrecognizableArtifactError = require('../lib/error/UnrecognizableArtifactError')

function splitArgv (originalArgv) {
  const artifactArgIndex = originalArgv.findIndex(lib.maven.isArtifactName)

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
  const packageJson = require('../../package')

  return packageJson.version
}

function parse (originalArgv) {
  let split = null
  if (!justDisplayHelpOrVersion(originalArgv)) {
    split = splitArgv(originalArgv)
  }

  const yargsArgv = yargs(split ? split.cliArgv.slice(2) : originalArgv.slice(2))
    .usage('mvnx [remote repository URL or identifier/]<groupid>:<artifactId>[:version]')
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
        type: 'string',
        default: lib.repository.defaultLocalRepositoryPath
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

module.exports = {
  parse
}
