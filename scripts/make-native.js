const fs = require('fs')

const pkg = require('pkg')

const { version } = require('../package')

async function makeTarget (target) {
  let output = `./native/mvnx-v${version}-${target}`

  if (target.includes('win')) {
    output += '.exe'
  }

  console.log(`Building native executable for target "${target}" at "${output}"`)

  await pkg.exec(['bin/mvnx.js', '--target', target, '--output', output])
}

(async function main () {
  const target = process.argv[2]

  if (!target) {
    console.error('Please specify a target as a command line argument!')

    process.exit(1)
  }

  try {
    await fs.promises.mkdir('native')
  } catch {
    // Hopefully, it just exists.
  }

  await makeTarget(target)
})()
