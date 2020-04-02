const mvnArtifactDownload = require('mvn-artifact-download')
const yargs = require('yargs')

function run() {
    yargs
        .commandDir('./commands')
        .demandCommand()
        .strict(true)
        .argv
}

module.exports = {
    run
}
