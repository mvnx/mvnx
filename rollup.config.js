import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import externals from 'rollup-plugin-node-externals'

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'cjs',
    exports: 'named'
  },
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    json(),
    externals()
  ]
}
