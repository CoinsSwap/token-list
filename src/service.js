import { writeFile } from 'fs'
import { promisify } from 'util'
import icons from 'cryptocurrency-icons/manifest.json'
import fetch from 'node-fetch'
import avatars from './avatars'
import cp from 'cp-file'
import ora from 'ora'
import ColorThief from 'color-thief-updated'
import contractAddresses from '@coinsswap/contract-address'

const spinner = ora().start()

const write = promisify(writeFile);

const rgbToHex = ([r,g,b]) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const writeIcons = async (symbol, icon) => {
  const icons = {
    black: `./node_modules/cryptocurrency-icons/svg/black/${icon}`,
    white: `./node_modules/cryptocurrency-icons/svg/white/${icon}`,
    color: `./node_modules/cryptocurrency-icons/svg/color/${icon}`
  }
  symbol = symbol.toLowerCase()
  for(let icon of Object.keys(icons)) {
    if (!icons[icon].includes('https')) {
      await cp(icons[icon], icons[icon].replace('./node_modules/cryptocurrency-icons/svg', './build/icons'))
    }
  }
}

const iconMap = new Map()

for (const {symbol} of icons) {
  const icon = symbol.toLowerCase()
  iconMap.set(symbol, `${icon}.svg`)
}

const get0xTokens = async network => {
  let url = 'https://api.0x.org/swap/v1/tokens'

  if (network && network !== 'mainnet') url = `https://${network}.api.0x.org/swap/v1/tokens`

  let tokens = await fetch(url)
  tokens = await tokens.json()
  tokens = tokens.records
  return tokens
}

const getUniswapTokens = async network => {
  const response = await fetch(`https://raw.githubusercontent.com/Uniswap/default-token-list/master/src/tokens/${network}.json`)
    return response.json()
}

const getWapnetTokens = async network => {
  return [
    {
     symbol: 'WETH',
     name: 'Wrapped Ether',
     address: contractAddresses[7475].weth,
     decimals: 18
   }, {
    symbol: 'ZRX',
    name: '0x Protocol Token',
    address: contractAddresses[7475].zrx.zrxToken,
    decimals: 18
  }, {
    symbol: 'CSS',
    name: 'CoinSSwap Token',
    address: contractAddresses[7475].cssToken,
    decimals: 18
  }]
}


// const getCoins


const getDexTokens = async (exchange, network) => {
  if (exchange === 'coinsswap') return getWapnetTokens(network)
  if (exchange === '0x') return get0xTokens(network)
  if (exchange === 'uniswap') {
    const tokens = await getUniswapTokens(network)
    return tokens
  }
}

const getTokens = async manifest => {
  const tokens = {}

  for (const network of Object.keys(manifest)) {
    tokens[network] = {}
    for (const dex of Object.keys(manifest[network])) {
      spinner.text = `fetching tokens from ${dex} for ${network}`
      if (!spinner.isSpinning) spinner.start()
      tokens[network][dex] = await getDexTokens(dex, network)
      spinner.succeed(`fetching tokens from ${dex} for ${network}`)
    }
  }
  return tokens
}

export default (async () => {
  const manifest = {
    mainnet: {uniswap: [], '0x': []},
    kovan: {uniswap: [], '0x': []},
    ropsten: {uniswap: []},
    wapnet: { coinsswap: [] }
  }
  const tokens = await getTokens(manifest)

  for (const network of Object.keys(manifest)) {
    for (const dex of Object.keys(manifest[network])) {
      const result = {}
      if (dex !== 'coinsswap' && network !== 'wapnet' || dex === 'coinsswap' && network === 'wapnet') {
        for (const token of tokens[network][dex]) {
          manifest[network][dex].push(token.symbol)

          let { symbol, name, address, icon, decimals } = token
          if (iconMap.has(symbol)) {
            icon = iconMap.get(symbol)
          } else {
            icon = iconMap.get('GENERIC')
          }
          await writeIcons(symbol, icon)

          const thief = new ColorThief()
          const dominantColor = rgbToHex(thief.getColor(`./node_modules/cryptocurrency-icons/svg/color/${icon}`))

          result[symbol] = { symbol, name, address, icon, decimals, dominantColor }
        }
        await write(`./build/tokens/${network}/${dex}.json`, JSON.stringify(result, null, 1))
      }
    }
  }
  await write('./build/manifest.json', JSON.stringify(manifest, null, 1))
})()
