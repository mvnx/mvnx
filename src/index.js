const yargs = require('yargs')

const maven = require('./lib/maven')

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
            type: 'string'
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

async function run () {
  const argv = cli()

  const artifact = maven.parseArtifactName(argv.artifact)

  console.log(artifact)
}

module.exports = {
  run
}
