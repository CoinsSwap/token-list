'use strict';

var fs = require('fs');
var util = require('util');
var icons = require('cryptocurrency-icons/manifest.json');
var fetch = require('node-fetch');
var cp = require('cp-file');
var ora = require('ora');
var ColorThief = require('color-thief-updated');
var contractAddresses = require('@coinsswap/contract-address');
var download = require('download');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var icons__default = /*#__PURE__*/_interopDefaultLegacy(icons);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var cp__default = /*#__PURE__*/_interopDefaultLegacy(cp);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var ColorThief__default = /*#__PURE__*/_interopDefaultLegacy(ColorThief);
var contractAddresses__default = /*#__PURE__*/_interopDefaultLegacy(contractAddresses);
var download__default = /*#__PURE__*/_interopDefaultLegacy(download);

const spinner = ora__default['default']().start();

const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);

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

const getPancakeswapTokens = async network => {
  const response = await fetch__default['default'](`https://raw.githubusercontent.com/pancakeswap/pancake-toolkit/master/packages/token-lists/src/tokens/pancakeswap-default.json`);
  return response.json()
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
     address: contractAddresses__default['default'][7475].weth,
     decimals: 18
   }, {
    symbol: 'ZRX',
    name: '0x Protocol Token',
    address: contractAddresses__default['default'][7475].zrx.zrxToken,
    decimals: 18
  }, {
    symbol: 'CSS',
    name: 'CoinSSwap Token',
    address: contractAddresses__default['default'][7475].cssToken,
    decimals: 18
  }]
};


// const getCoins


const getDexTokens = async (exchange, network) => {
  if (exchange === 'coinsswap') return getWapnetTokens()
  if (exchange === '0x') return get0xTokens(network)
  if (exchange === 'uniswap') {
    const tokens = await getUniswapTokens(network);
    return tokens
  }
  if (exchange === 'pancakeswap') return getPancakeswapTokens()
};

const getTokens = async manifest => {
  const tokens = {};

  for (const network of Object.keys(manifest)) {
    tokens[network] = {};
    for (const dex of Object.keys(manifest[network])) {
      spinner.text = `fetching tokens from ${dex} for ${network}`;
      if (!spinner.isSpinning) spinner.start();
      tokens[network][dex] = await getDexTokens(dex, network);
      spinner.succeed(`fetching tokens from ${dex} for ${network}`);
    }
  }
  return tokens
};

var service = (async () => {
  const manifest = {
    mainnet: {uniswap: [], '0x': [], pancakeswap: []},
    kovan: {uniswap: [], '0x': []},
    ropsten: {uniswap: []},
    wapnet: { coinsswap: [] }
  };
  const tokens = await getTokens(manifest);

  for (const network of Object.keys(manifest)) {
    console.log(network);
    for (const dex of Object.keys(manifest[network])) {
      console.log(dex);
      const result = {};
      if (dex !== 'coinsswap' && network !== 'wapnet' || dex === 'coinsswap' && network === 'wapnet') {
        for (const token of tokens[network][dex]) {
          manifest[network][dex].push(token.symbol);

          let { symbol, name, address, icon, decimals, logoURI } = token;
          if (iconMap.has(symbol)) {
            icon = iconMap.get(symbol);
          } else {
            icon = logoURI ? logoURI : iconMap.get('GENERIC');
          }
          await writeIcons(symbol, icon);

          const thief = new ColorThief__default['default']();
          let dominantColor;
          if (!iconMap.has(symbol)) {
            if(logoURI && !logoURI.includes('ipfs')) {
              try {
                await download__default['default'](logoURI, 'build/icons/color', {filename: `${symbol}.png`});
                const buffer = await read(`build/icons/color/${symbol}.png`);
                dominantColor = rgbToHex(thief.getColor(`./build/icons/color/${symbol}.png`));
                icon = `${symbol}.png`;
              } catch (e) {
                console.warn(`nothing found for ${name}`);
              }
            }
          } else {
            dominantColor = rgbToHex(thief.getColor(`./node_modules/cryptocurrency-icons/svg/color/${icon}`));
          }


          result[symbol] = { symbol, name, address, icon, decimals, dominantColor };
        }
        await write(`./build/tokens/${network}/${dex}.json`, JSON.stringify(result, null, 1));
      }
    }
  }
  await write('./build/manifest.json', JSON.stringify(manifest, null, 1));
})();

module.exports = service;
