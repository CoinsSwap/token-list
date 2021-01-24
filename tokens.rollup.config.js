import json from '@rollup/plugin-json'

export default [{
  input: ['build/tokens/mainnet/0x.json', 'build/tokens/mainnet/uniswap.json'],
  output: [{
    dir: 'build/module/mainnet',
    format: 'es'
  }, {
    dir: 'build/commonjs/mainnet',
    format: 'cjs'
  }],
  plugins: [ json() ]
}, {
  input: ['build/tokens/kovan/0x.json', 'build/tokens/kovan/uniswap.json'],
  output: [{
    dir: 'build/module/kovan',
    format: 'es'
  }, {
    dir: 'build/commonjs/kovan',
    format: 'cjs'
  }],
  plugins: [ json() ]
}]
