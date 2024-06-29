'use strict';

var promises = require('fs/promises');
var icons = require('cryptocurrency-icons/manifest.json');
var fetch = require('node-fetch');
var cp = require('cp-file');
var ora = require('ora');
var contractAddresses = require('@coinsswap/contract-address');
var download = require('download');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var icons__default = /*#__PURE__*/_interopDefaultLegacy(icons);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var cp__default = /*#__PURE__*/_interopDefaultLegacy(cp);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var contractAddresses__default = /*#__PURE__*/_interopDefaultLegacy(contractAddresses);
var download__default = /*#__PURE__*/_interopDefaultLegacy(download);

const spinner = ora__default['default']().start();

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

const getPancakeswapTokens = async network => {
  const response = await fetch__default['default'](`https://tokens.pancakeswap.finance/pancakeswap-top-100.json`);
  const result = await response.json();
  return result.tokens
};

const getCoinGeckoTokens = async network => {
  const response = await fetch__default['default'](`https://tokens.pancakeswap.finance/coingecko.json`);
  const result = await response.json();
  return result.tokens
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
  try {
    if (exchange === 'coinsswap') return getWapnetTokens(network)
      // if (exchange === '0x') return get0xTokens(network)
      if (exchange === 'uniswap') {
        const tokens = await getUniswapTokens(network);
        return tokens
      }
      if (exchange === 'pancakeswap') return getPancakeswapTokens(network)
      if (exchange === 'coingecko') return getCoinGeckoTokens(network)
  } catch (error) {
    console.warn(error);
    return []
  }
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

const tokenTask = async (manifest, token, network, dex, result) => {
  manifest[network][dex].push(token.symbol);

          let { symbol, name, address, icon, decimals, logoURI } = token;
          if (iconMap.has(symbol)) {
            icon = iconMap.get(symbol);
          } else {
            icon = logoURI ? logoURI : iconMap.get('GENERIC');
          }
          await writeIcons(symbol, icon);

          // const thief = new ColorThief()
          // let dominantColor
          if (!iconMap.has(symbol)) {
            if(logoURI && !logoURI.includes('ipfs')) {
              try {
                const fd = await promises.open(`build/icons/color/${symbol}.png`);
                await fd.close();
              } catch (error) {
                try {
                  await download__default['default'](logoURI, 'build/icons/color', {filename: `${symbol}.png`});
                  const buffer = await promises.readFile(`build/icons/color/${symbol}.png`);
                  // dominantColor = rgbToHex(thief.getColor(`./build/icons/color/${symbol}.png`))
                  icon = `${symbol}.png`;
                } catch (e) {
                  console.warn(`nothing found for ${name}`);
                }
              }
            }
          }


          // result[symbol] = { symbol, name, address, icon, decimals, dominantColor }
          result[symbol] = { symbol, name, address, icon, decimals };

};

const dexTask = async (manifest ,tokens, dex, network) => {
  const promises$1 = [];
  console.log(dex);
  const result = {};
  if (dex !== 'coinsswap' && network !== 'wapnet' || dex === 'coinsswap' && network === 'wapnet') {
    for (const token of tokens[network][dex]) {
      promises$1.push(tokenTask(manifest, token, network, dex, result));
    }
    await Promise.all(promises$1);
    await promises.writeFile(`./build/tokens/${network}/${dex}.json`, JSON.stringify(result, null, 1));
  }
};

var service = (async () => {
  const manifest = {
    mainnet: {uniswap: []},
    kovan: {uniswap: []},
    wapnet: { coinsswap: [] },
    binance: {
      pancakeswap: [], coingecko: []
    }
  };
  const tokens = await getTokens(manifest);

  const promises$1 = [];

  for (const network of Object.keys(manifest)) {
    console.log(network);
    for (const dex of Object.keys(manifest[network])) {
      promises$1.push(dexTask(manifest, tokens, dex, network));
    }
  }
  await Promise.all(promises$1);
  await promises.writeFile('./build/manifest.json', JSON.stringify(manifest, null, 1));
})();

module.exports = service;
