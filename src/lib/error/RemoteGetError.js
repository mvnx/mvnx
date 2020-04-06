const BaseMvnxError = require('./BaseMvnxError')

class RemoteGetError extends BaseMvnxError {
  constructor (context, cause) {
    super('EREMOTEGET', context, cause)
  }

  get details () {
    if (this.context.destination) {
      return `Failed to download "${this.context.url}" to local destination "${this.context.destination}".`
    } else {
      return `Failed to get contents from "${this.context.url}".`
    }
  }

  get solution () {
    return 'This issue might have rather different causes and thus different solutions may apply:\n' +
     '  * Make sure that you\'re connected to the internet.\n' +
     '  * Check if you have enough free space to accomodate the downloaded file.\n' +
     '  * Check if you have the correct permissions to create the destination file.'
  }
}

module.exports = RemoteGetError
