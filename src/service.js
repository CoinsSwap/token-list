import { readFile, writeFile } from 'fs'
import { promisify } from 'util'
import icons from 'cryptocurrency-icons/manifest.json'
import fetch from 'node-fetch'
import avatars from './avatars'
import cp from 'cp-file'

const read = promisify(readFile)
const write = promisify(writeFile);

const writeIcons = async (symbol, icons) => {
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
  const black = `./node_modules/cryptocurrency-icons/svg/black/${icon}.svg`
  const white = `./node_modules/cryptocurrency-icons/svg/white/${icon}.svg`
  const color = `./node_modules/cryptocurrency-icons/svg/color/${icon}.svg`
  iconMap.set(icon, { black, white, color })
}
export default (async () => {
  const url = `https://api.0x.org/swap/v1/tokens`
  let tokens = await fetch(url)
  tokens = await tokens.json()
  tokens = tokens.records

  for (const token of tokens) {
    if (iconMap.has(token.symbol.toLowerCase())) {
      const icons = iconMap.get(token.symbol.toLowerCase())
      token.icons = icons
    } else if (avatars[token.symbol.toLowerCase()]) {
      token.icons = { color: avatars[token.symbol.toLowerCase()] }
    } else {
      token.icons = iconMap.get('generic')
    }
    await writeIcons(token.symbol, token.icons)
    const csUrl ='https://raw.githubusercontent.com/coinsswap/token-list/master/build/icons'
    const icons = {}
    for (var key of Object.keys(token.icons)) {
      icons[key] = token.icons[key].replace('./node_modules/cryptocurrency-icons/svg', csUrl)
      // console.log(icons[key]);
    }
    // console.log(token.icons);
    token.icons = icons
    // console.log(token.icons);
  }
  await write('./build/tokens.json', JSON.stringify(tokens, null, 1))

})()
