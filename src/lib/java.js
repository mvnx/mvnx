const { execSync } = require('child_process')

const log = require('./log')

function executeJar (options) {
  const command = `${options.javaExecutable} -jar ${options.jar} ${options.arguments.join(' ')}`

  log(`Executing JAR\n  ${command}`)

  execSync(command, {
    stdio: 'inherit'
  })
}

module.exports = {
  executeJar
}
