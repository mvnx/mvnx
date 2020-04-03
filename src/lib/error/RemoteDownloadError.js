const BaseMvnxError = require('./BaseMvnxError')

class RemoteDownloadError extends BaseMvnxError {
  constructor (context, cause) {
    super('EREMOTEDOWNLOAD', context, cause)
  }

  get details () {
    return `Failed to download "${this.context.url}" to local destination "${this.context.destination}".`
  }

  get solution () {
    return 'This issue might have rather different causes and thus different solutions may apply:\n' +
     '  * Make sure that you\'re connected to the internet.\n' +
     '  * Check if you have enough free space to accomodate the downloaded file.\n' +
     '  * Check if you have the correct permissions to create the destination file.'
  }
}

module.exports = RemoteDownloadError
