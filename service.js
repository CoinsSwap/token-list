'use strict';

var fs = require('fs');
var util = require('util');
var icons = require('cryptocurrency-icons/manifest.json');
var fetch = require('node-fetch');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var icons__default = /*#__PURE__*/_interopDefaultLegacy(icons);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);

var avatars = {
  '1inch': 'https://avatars3.githubusercontent.com/u/43341157?s=200&v=4',
  'tbtc': 'https://github.com/keep-network/tbtc-dapp/raw/master/public/android-chrome-512x512.png',
  'stake': 'https://avatars1.githubusercontent.com/u/55742898?s=200&v=4'
};

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);

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
  tokens = tokens.filter(token => {
    if (iconMap.has(token.symbol.toLowerCase())) {
      const icons = iconMap.get(token.symbol.toLowerCase());
      token.icons = icons;
    } else if (avatars[token.symbol.toLowerCase()]) {
      token.icons = { color: avatars[token.symbol.toLowerCase()] };
    } else {
      token.icons = iconMap.get('generic');
    }
    return token
  });

  await write('./build/tokens.json', JSON.stringify(tokens, null, 2));

})();

module.exports = service;
