const https = require('https')
const fs = require('fs')

const RemoteDownloadError = require('./error/RemoteDownloadError')

async function intoString (url) {
  return new Promise(function downloadPromise (resolve, reject) {
    const request = https.get(url, function responseHandler (response) {
      if (response.statusCode !== 200) {
        resolve(null)

        return
      }

      let output = ''

      response.on('data', function downloadData (chunk) {
        output += chunk
      })

      response.on('close', function downloadFinished () {
        resolve(output)
      })

      response.on('error', function downloadError (err) {
        reject(new RemoteDownloadError({ url }, err))
      })
    })

    request.on('error', function requestError (err) {
      reject(new RemoteDownloadError({ url }, err))
    })
  })
}

async function intoFile (url, destination) {
  return new Promise(function downloadPromise (resolve, reject) {
    const request = https.get(url, function responseHandler (response) {
      if (response.statusCode !== 200) {
        resolve(false)

        return
      }

      const output = fs.createWriteStream(destination)

      response.pipe(output)

      output.on('finish', function downloadFinished () {
        output.end(() => resolve(true))
      })

      output.on('error', function downloadError (err) {
        reject(new RemoteDownloadError({ url, destination }, err))

        fs.unlinkSync(destination)
      })
    })

    request.on('error', function requestError (err) {
      reject(new RemoteDownloadError({ url, destination }, err))
    })
  })
}

module.exports = {
  intoString,
  intoFile
}
