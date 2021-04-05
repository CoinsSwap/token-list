'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var util = require('util');
var icons = require('cryptocurrency-icons/manifest.json');
var fetch = require('node-fetch');
var cp = require('cp-file');
var ora = require('ora');
var ColorThief = require('color-thief-updated');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var icons__default = /*#__PURE__*/_interopDefaultLegacy(icons);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var cp__default = /*#__PURE__*/_interopDefaultLegacy(cp);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var ColorThief__default = /*#__PURE__*/_interopDefaultLegacy(ColorThief);

const spinner = ora__default['default']().start();

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);

const dexes = ['0x', 'uniswap', 'coinsswap'];
const networks = ['mainnet', 'kovan', 'wapnet'];

const rgbToHex = ([r,g,b]) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const writeIcons = async (symbol, icon) => {
  const icons = {
    black: `./node_modules/cryptocurrency-icons/svg/black/${icon}`,
    white: `./node_modules/cryptocurrency-icons/svg/white/${icon}`,
    color: `./node_modules/cryptocurrency-icons/svg/color/${icon}`
  };
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
  iconMap.set(symbol, `${icon}.svg`);
}

const get0xTokens = async network => {
  let url = 'https://api.0x.org/swap/v1/tokens';

  if (network && network !== 'mainnet') url = `https://${network}.api.0x.org/swap/v1/tokens`;

  let tokens = await fetch__default['default'](url);
  tokens = await tokens.json();
  tokens = tokens.records;
  return tokens
};

const getUniswapTokens = async network => {
  const response = await fetch__default['default'](`https://raw.githubusercontent.com/Uniswap/default-token-list/master/src/tokens/${network}.json`);
    return response.json()
};

const getWapnetTokens = async network => {
  return [
    {
     symbol: 'WETH',
     name: 'Wrapped Ether',
     address: '0x0276b00A3da95DBf45d177E0Ceb5251e9c1ECf11',
     decimals: 18
   }, {
    symbol: 'ZRX',
    name: '0x Protocol Token',
    address: '0x3ea3a770995Dc2439433fD994A58469868f6934c',
    decimals: 18
   }
  ]
};


const getDexTokens = async (exchange, network) => {
  if (exchange === 'coinsswap') return getWapnetTokens()
  if (exchange === '0x') return get0xTokens(network)
  if (exchange === 'uniswap') {
    const tokens = await getUniswapTokens(network);
    return tokens
  }
};

const getTokens = async () => {
  const mainnet = {};
  const kovan = {};
  const wapnet = {};

  for (const dex of dexes) {
    spinner.text = `fetching tokens from ${dex} for mainnet`;
    if (!spinner.isSpinning) spinner.start();
    let tokens = await getDexTokens(dex, 'mainnet');
    mainnet[dex] = tokens;

    spinner.succeed(`fetching tokens from ${dex} for mainnet`);

    spinner.text = `fetching tokens from ${dex} for kovan`;
    if (!spinner.isSpinning) spinner.start();
    tokens = await getDexTokens(dex, 'kovan');
    kovan[dex] = tokens;

    spinner.succeed(`fetching tokens from ${dex} for kovan`);

    if (dex === 'coinsswap') {
      spinner.text = `fetching tokens from ${dex} for wapnet`;
      if (!spinner.isSpinning) spinner.start();

      tokens = await getDexTokens(dex, 'wapnet');
      wapnet[dex] = tokens;

      spinner.succeed(`fetching tokens from ${dex} for wapnet`);
    }

  }
  return {mainnet, kovan, wapnet}
};

var service = (async () => {
  const tokens = await getTokens();

  const manifest = {
    mainnet: {uniswap: [], '0x': []},
    kovan: {uniswap: [], '0x': []},
    wapnet: { coinsswap: [] }
  };

  for (const network of networks) {
    for (const dex of dexes) {
      const result = {};
      if (dex !== 'coinsswap' && network !== 'wapnet' || dex === 'coinsswap' && network === 'wapnet') {

        console.log(network, dex);
        for (const token of tokens[network][dex]) {
          manifest[network][dex].push(token.symbol);

          let { symbol, name, address, icon, decimals } = token;
          console.log(token);
          if (iconMap.has(symbol)) {
            icon = iconMap.get(symbol);
          } else {
            icon = iconMap.get('GENERIC');
          }
          await writeIcons(symbol, icon);

          const thief = new ColorThief__default['default']();
          const dominantColor = rgbToHex(thief.getColor(`./node_modules/cryptocurrency-icons/svg/color/${icon}`));

          result[symbol] = { symbol, name, address, icon, decimals, dominantColor };
        }
        await write(`./build/tokens/${network}/${dex}.json`, JSON.stringify(result, null, 1));
      }
    }
  }
  await write('./build/manifest.json', JSON.stringify(manifest, null, 1));
})();

exports.default = service;
exports.dexes = dexes;
exports.networks = networks;
