const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')

async function rmdirp (from, to) {
  const fromSegments = from.split(path.sep)
  const toSegments = to.split(path.sep)
    .slice(fromSegments.length)

  for (let i = toSegments.length; i >= 0; --i) {
    const deletePath = path.join(...fromSegments, ...toSegments.slice(0, i))

    await fs.promises.rmdir(deletePath)
  }
}

module.exports = {
  mkdirp,
  rmdirp
}
