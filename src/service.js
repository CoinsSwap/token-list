import { readFile, writeFile } from 'fs'
import { promisify } from 'util'
import icons from 'cryptocurrency-icons/manifest.json'
import fetch from 'node-fetch'
import avatars from './avatars'
import cp from 'cp-file'
import ora from 'ora'
import ColorThief from 'color-thief-updated'

const spinner = ora().start()

const read = promisify(readFile)
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
const getDexTokens = async (exchange, network) => {
  if (exchange === '0x') return get0xTokens(network)
  if (exchange === 'uniswap') {
    const tokens = await getUniswapTokens(network)
    return tokens
  }
}

const getTokens = async () => {
  const mainnet = {}
  const kovan = {}

  const dexes = ['0x', 'uniswap']

  for (const dex of dexes) {
    spinner.text = `fetching tokens from ${dex} for mainnet`
    if (!spinner.isSpinning) spinner.start()
    let tokens = await getDexTokens(dex, 'mainnet')
    mainnet[dex] = tokens

    spinner.succeed(`fetching tokens from ${dex} for mainnet`)

    spinner.text = `fetching tokens from ${dex} for kovan`
    if (!spinner.isSpinning) spinner.start()
    tokens = await getDexTokens(dex, 'kovan')
    kovan[dex] = tokens

    spinner.succeed(`fetching tokens from ${dex} for kovan`)
  }
  return {mainnet, kovan}
}

export default (async () => {
  const tokens = await getTokens()

  const manifest = {
    mainnet: {uniswap: [], '0x': []},
    kovan: {uniswap: [], '0x': []}
  }

  const networks = ['mainnet', 'kovan']
  const dexes = ['0x', 'uniswap']

  for (const network of networks) {
    for (const dex of dexes) {
      const result = {}
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
  await write('./build/manifest.json', JSON.stringify(manifest, null, 1))
})()
