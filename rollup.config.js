import json from '@rollup/plugin-json'

export default [{
  input: 'src/service.js',
  output: [{
    file: 'service.js',
    format: 'cjs'
  }]
}, {
  input: 'src/token-list.js',
  output: [{
    file: 'token-list.js',
    format: 'cjs'
  }, {
    file: 'token-list.mjs',
    format: 'es'
  }]
}]
