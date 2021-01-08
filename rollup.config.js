import json from '@rollup/plugin-json'

export default [{
  input: 'src/service.js',
  output: [{
    file: 'service.js',
    format: 'cjs'
  }]
}]
