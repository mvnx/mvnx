let quiet = false

function log (message) {
  if (!quiet) {
    console.error(message)
  }
}

log.configure = function configure (options) {
  quiet = options.quiet
}

module.exports = log
