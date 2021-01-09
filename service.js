'use strict';

var fs = require('fs');
var util = require('util');
var icons = require('cryptocurrency-icons/manifest.json');
var fetch = require('node-fetch');
var cp = require('cp-file');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var icons__default = /*#__PURE__*/_interopDefaultLegacy(icons);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var cp__default = /*#__PURE__*/_interopDefaultLegacy(cp);

var avatars = {
  '1inch': 'https://avatars3.githubusercontent.com/u/43341157?s=200&v=4',
  'tbtc': 'https://github.com/keep-network/tbtc-dapp/raw/master/public/android-chrome-512x512.png',
  'stake': 'https://avatars1.githubusercontent.com/u/55742898?s=200&v=4'
};

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);

const writeIcons = async (symbol, icons) => {
  symbol = symbol.toLowerCase();
  for(let icon of Object.keys(icons)) {
    if (!icons[icon].includes('https')) {
      await cp__default['default'](icons[icon], icons[icon].replace('./node_modules/cryptocurrency-icons/svg', './build/icons'));
    }
  }
};

const iconMap = new Map();

for (const {symbol} of icons__default['default']) {
  const icon = symbol.toLowerCase();
  const black = `./node_modules/cryptocurrency-icons/svg/black/${icon}.svg`;
  const white = `./node_modules/cryptocurrency-icons/svg/white/${icon}.svg`;
  const color = `./node_modules/cryptocurrency-icons/svg/color/${icon}.svg`;
  iconMap.set(icon, { black, white, color });
}
var service = (async () => {
  const url = `https://api.0x.org/swap/v1/tokens`;
  let tokens = await fetch__default['default'](url);
  tokens = await tokens.json();
  tokens = tokens.records;

  for (const token of tokens) {
    if (iconMap.has(token.symbol.toLowerCase())) {
      const icons = iconMap.get(token.symbol.toLowerCase());
      token.icons = icons;
    } else if (avatars[token.symbol.toLowerCase()]) {
      token.icons = { color: avatars[token.symbol.toLowerCase()] };
    } else {
      token.icons = iconMap.get('generic');
    }
    await writeIcons(token.symbol, token.icons);
    const csUrl ='https://raw.githubusercontent.com/coinsswap/token-list/master/build/icons';
    const icons = {};
    for (var key of Object.keys(token.icons)) {
      icons[key] = token.icons[key].replace('./node_modules/cryptocurrency-icons/svg', csUrl);
      // console.log(icons[key]);
    }
    // console.log(token.icons);
    token.icons = icons;
    // console.log(token.icons);
  }
  await write('./build/tokens.json', JSON.stringify(tokens, null, 1));

})();

module.exports = service;
