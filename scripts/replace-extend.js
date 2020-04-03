const fs = require('fs')

const BAD_EXTEND = 'extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },'
const GOOD_EXTEND = 'extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = (parent || {}).prototype; child.prototype = new ctor(); child.__super__ = (parent || {}).prototype; return child; },'

const BUNDLE_PATH = `${__dirname}/../dist/index.js`;

(async function main () {
  let contents = await fs.promises.readFile(BUNDLE_PATH, { encoding: 'utf8' })
  let newContents = contents

  do {
    contents = newContents
    newContents = contents.replace(BAD_EXTEND, GOOD_EXTEND)
  } while (contents !== newContents)

  await fs.promises.writeFile(BUNDLE_PATH, newContents, { encoding: 'utf8' })
})()
