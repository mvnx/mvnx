const { execSync } = require('child_process')

function executeJar (options) {
  const command = `${options.javaExecutable} -jar ${options.jar} ${options.arguments.join(' ')}`

  execSync(command, {
    stdio: 'inherit'
  })
}

module.exports = {
  executeJar
}
