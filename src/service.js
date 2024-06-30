import { writeFile, open, copyFile, readFile } from 'fs/promises';
import icons from 'cryptocurrency-icons/manifest.json' with { type: 'json' };
import fetch from 'node-fetch';
import ora from 'ora';
import ColorThief from 'color-thief-updated';
import contractAddresses from '@coinsswap/contract-address';
import download from 'download';

const spinner = ora().start();

const rgbToHex = ([r,g,b]) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const writeIcons = async (icon) => {
  const icons = {
    black: `./node_modules/cryptocurrency-icons/svg/black/${icon}`,
    white: `./node_modules/cryptocurrency-icons/svg/white/${icon}`,
    color: `./node_modules/cryptocurrency-icons/svg/color/${icon}`
  };
  for(let icon of Object.keys(icons)) {
    if (!icons[icon].includes('https')) {
      await copyFile(icons[icon], icons[icon].replace('./node_modules/cryptocurrency-icons/svg', './build/icons'));
    }
  }
};

const iconMap = new Map();

for (const {symbol} of icons) {
  const icon = symbol.toLowerCase();
  console.log(symbol);
  iconMap.set(symbol, `${icon}.svg`);
}

const getPancakeswapTokens = async network => {
  const response = await fetch(`https://tokens.pancakeswap.finance/pancakeswap-top-100.json`);
  const result = await response.json();
  return result.tokens
};

const getCoinGeckoTokens = async network => {
  const response = await fetch(`https://tokens.pancakeswap.finance/coingecko.json`);
  const result = await response.json();
  return result.tokens
};

const getUniswapTokens = async network => {
  const response = await fetch(`https://raw.githubusercontent.com/Uniswap/default-token-list/master/src/tokens/${network}.json`);
    return response.json()
};

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
if (token.symbol === 'CON') return
  
          let { symbol, name, address, icon, decimals, logoURI } = token;
          manifest[network][dex].push(token.symbol);   

          const iconName = symbol.toLowerCase();
          // const thief = new ColorThief();
          // let dominantColor;
          if (iconMap.has(symbol)) {
            icon = iconMap.get(symbol);
            try {
              const fd = await open(`build/icons/color/${iconName}.svg`);
              fd.close();
            } catch (error) {
              await writeIcons(icon);  
            }
            // dominantColor = rgbToHex(thief.getColor(`./node_modules/cryptocurrency-icons/svg/color/${icon}`));            
          } else {
            icon = logoURI ? logoURI : iconMap.get('generic');
            if(logoURI && !logoURI.includes('ipfs')) {
              try {
                const fd = await open(`build/icons/color/${iconName}.png`);
                await fd.close();
              } catch (error) {
                try {
                  await download(logoURI, 'build/icons/color', {filename: `${iconName}.png`});
                  // const buffer = await readFile(`build/icons/color/${symbol}.png`)
                  // dominantColor = rgbToHex(thief.getColor(`./build/icons/color/${iconName}.png`));
                  icon = `${iconName}.png`;
                } catch (e) {
                  // if (e.statusCode === 404 || e.statusCode === 404) {
                    icon = `generic.svg`;
                  // }
                  // const buffer = await readFile(`build/icons/color/generic.svg`)
                  // dominantColor = rgbToHex(thief.getColor(buffer));
                  console.warn(`nothing found for ${name}, falling back to generic icon`);
                }
              }
            }
          }
          // console.log(dominantColor);
          // result[symbol] = { symbol, name, address, icon, decimals, dominantColor };
          result[symbol] = { symbol, name, address, icon, decimals }

};

const dexTask = async (manifest ,tokens, dex, network) => {
  const promises = [];
  console.log(dex);
  const result = {};
  if (dex !== 'coinsswap' && network !== 'wapnet' || dex === 'coinsswap' && network === 'wapnet') {
    for (const token of tokens[network][dex]) {
      promises.push(tokenTask(manifest, token, network, dex, result));
    }
    await Promise.all(promises);
    await writeFile(`./build/tokens/${network}/${dex}.json`, JSON.stringify(result, null, 1));
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

  const promises = [];

  for (const network of Object.keys(manifest)) {
    console.log(network);
    for (const dex of Object.keys(manifest[network])) {
      promises.push(dexTask(manifest, tokens, dex, network));
    }
  }
  await Promise.all(promises);
  await writeFile('./build/manifest.json', JSON.stringify(manifest, null, 1));
})();

export { service as default };
