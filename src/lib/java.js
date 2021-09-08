const { execSync } = require('child_process')

const log = require('./log')

const JavaNotFoundError = require('./error/JavaNotFoundError')

function executeJar (options) {
  const command = `${options.javaExecutable} -jar ${options.jar} ${options.arguments.join(' ')}`

  log(`Executing JAR\n  ${command}`)

  const bareJavaExecutable = command.split(' ').shift()
  try {
    execSync(`${bareJavaExecutable} -version`, {
      stdio: 'ignore'
    })
  } catch (err) {
    throw new JavaNotFoundError({ executable: bareJavaExecutable })
  }

  try {
    execSync(command, {
      stdio: 'inherit'
    })
  } catch (err) {
    // Silent
  }
}

module.exports = {
  executeJar
}
