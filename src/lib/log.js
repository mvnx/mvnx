let quiet = false

function log (message) {
  if (!quiet) {
    console.log(message)
  }
}

log.configure = function configure (options) {
  quiet = options.quiet
}

module.exports = log
