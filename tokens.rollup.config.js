import json from '@rollup/plugin-json'

export default [{
  input: 'build/tokens.json',
  output: [{
    file: 'build/module/tokens.js',
    format: 'es'
  }, {
    file: 'build/commonjs/tokens.js',
    format: 'cjs'
  }],
  plugins: [ json() ]
}]
