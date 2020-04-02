const yargs = require('yargs')

function cli() {
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
                    'quiet': {
                        alias: 'q',
                        describe: '',
                        type: Boolean
                    },
                })
        })
        .strict(true)
        .argv
}

function run() {
    
}

module.exports = {
    run
}
