const mvnArtifactDownload = require('mvn-artifact-download')

module.exports = {
    command: 'execute <artifact>',
    aliases: '$0',
    describe: 'Execute the specified artifact.',
    builder: {
        artifact: {
            type: 'string',
            required: true
        }
    },
    async handler(argv) {
        const { artifact } = argv

        await mvnArtifactDownload.default(artifact)
    }
}
