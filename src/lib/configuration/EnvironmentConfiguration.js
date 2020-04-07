const USERNAME_ENVIRONMENT_KEY = 'MVNX_REMOTE_USERNAME'
const PASSWORD_ENVIRONMENT_KEY = 'MVNX_REMOTE_PASSWORD'

const EnvironmentConfiguration = {
  EnvironmentConfiguration (env) {
    this._remoteUsername = env[USERNAME_ENVIRONMENT_KEY]
    this._remotePassword = env[PASSWORD_ENVIRONMENT_KEY]

    return this
  },

  get remoteUsername () {
    return this._remoteUsername
  },

  get remotePassword () {
    return this._remotePassword
  }
}

EnvironmentConfiguration.fromProcessEnv = function fromProcessEnv () {
  return Object.create(EnvironmentConfiguration).EnvironmentConfiguration(process.env)
}

module.exports = EnvironmentConfiguration
