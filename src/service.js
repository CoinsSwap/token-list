import { readFile, writeFile } from 'fs'
import { promisify } from 'util'
import icons from 'cryptocurrency-icons/manifest.json'
import fetch from 'node-fetch'
import avatars from './avatars'

const read = promisify(readFile)
const write = promisify(writeFile);

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
  tokens = tokens.filter(token => {
    if (iconMap.has(token.symbol.toLowerCase())) {
      const icons = iconMap.get(token.symbol.toLowerCase())
      token.icons = icons
    } else if (avatars[token.symbol.toLowerCase()]) {
      token.icons = { color: avatars[token.symbol.toLowerCase()] }
    } else {
      token.icons = iconMap.get('generic')
    }
    return token
  })

  await write('./build/tokens.json', JSON.stringify(tokens, null, 2))

})()
