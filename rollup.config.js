import json from '@rollup/plugin-json'

export default [{
  input: 'src/service.js',
  plugins: [json],
  output: [{
    dir: 'dist',
    format: 'es'
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
