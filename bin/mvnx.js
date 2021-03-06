#!/usr/bin/env node

const mvnx = require('../dist');

(async function main () {
  try {
    await mvnx.run(process.argv)
  } catch (err) {
    if (isBaseMvnxError(err)) {
      console.error('\n' + err.toString())
    } else {
      console.error('\nUnexpected error occurred!\nMost likely, this is an issue with mvnx. Please submit an issue to\n\n  https://github.com/mvnx/mvnx/issues\n')

      console.error(err)
    }

    process.exit(1)
  }

  function isBaseMvnxError (err) {
    return Object.getPrototypeOf(err.constructor).name === 'BaseMvnxError'
  }
})()
