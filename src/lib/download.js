const https = require('https')
const fs = require('fs')

async function download (url, destination) {
  return new Promise(function downloadPromise (resolve, reject) {
    const request = https.get(url, function responseHandler (response) {
      if (response.statusCode !== 200) {
        reject(new Error(`Response status code was ${response.statusCode}`))
      }

      const output = fs.createWriteStream(destination)

      response.pipe(output)

      output.on('finish', function downloadFinished () {
        output.end(resolve)
      })

      output.on('error', function downloadError (err) {
        reject(err)

        fs.unlinkSync(output)
      })
    })

    request.on('error', function requestError (err) {
      reject(err)
    })
  })
}

module.exports = download
