const yargs = require('yargs')

const maven = require('./lib/maven')
const fs = require('fs')

function cli () {
  return yargs
    .command('$0 <artifact> [arguments...]', '', yargs => {
      yargs
        .positional('artifact', {
          describe: '',
          type: 'string'
        })
        .positional('arguments', {
          describe: '',
          type: 'string'
        })
        .options({
          'ignore-local': {
            describe: '',
            type: Boolean,
            conflicts: ['only-local']
          },
          'only-local': {
            describe: '',
            type: Boolean,
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
            type: Boolean
          }
        })
    })
    .strict(true)
    .argv
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

async function run () {
  const argv = cli()

  const obtainOptions = makeObtainOptionsFromArgv(argv)

  console.log(obtainOptions)

  let obtainedArtifact
  try {
    const obtainedArtifact = await maven.obtainArtifact(obtainOptions)

    console.log(obtainedArtifact)

    if (!obtainedArtifact) {
      console.log('F')
    }
  } finally {
    if (obtainedArtifact && obtainedArtifact.temporary) {
      await fs.promises.unlink(obtainedArtifact.path)
    }
  }
}

module.exports = {
  run
}
