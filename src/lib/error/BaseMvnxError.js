class BaseMvnxError extends Error {
  constructor (code, context, cause) {
    super()
    this.code = code
    this.context = context || {}
    this.cause = cause
  }

  toString () {
    const chalk = require('chalk')
    const EOL = require('os').EOL

    let output = chalk.redBright('ERROR') + ' – ' + chalk.redBright.bold(this.code) + EOL

    if (this.details) {
      output += chalk.bold('Details') + EOL + this.details + EOL + EOL
    }

    if (this.solution) {
      output += chalk.bold('Possible Solution') + EOL + this.solution + EOL + EOL
    }

    output += chalk.bold('More information at: ') + this.link

    if (this.cause) {
      output += EOL + EOL + chalk.bold('Caused By') + EOL + this.cause.stack
    }

    return output
  }

  get message () {
    return this.details
  }

  addToContext (obj) {
    Object.assign(this.context, obj)
  }

  get link () {
    const config = require('../config').get('error')

    return `${config.baseUrl}/${this.code}`
  }

  get details () {
    return undefined
  }

  get solution () {
    return undefined
  }
}

module.exports = BaseMvnxError
