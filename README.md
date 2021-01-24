[![Build Status](https://img.shields.io/travis/com/coinsswap/token-list/main.svg?style=for-the-badge)](https://travis-ci.com/CoinsSwap/token-list)
[![npm](https://img.shields.io/npm/dt/@coinsswap/token-list.svg?style=for-the-badge)](https://www.npmjs.com/package/@coinsswap/token-list)
[![David](https://img.shields.io/david/coinsswap/token-list.svg?style=for-the-badge)](https://github.com/coinsswap/token-list)
[![npm](https://img.shields.io/npm/v/@coinsswap/token-list.svg?style=for-the-badge)](https://www.npmjs.com/package/@coinsswap/token-list)

# token-list
> The default token list for CoinsSwap.

## Why?

Is it me or does like every list have missing icons?
The internet is overloaded enough, stop trying to load stuff thats moved or gone.

## How?
* first check if the token is available in [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons)
* if none is found, a generic icon will be applied

## install
```sh
npm i --save @coinsswap/token-list
```

## usage
```js
import list from '@coinsswap/token-list'

list.mainnet.uniswap // { ETH: {...}, UNI: {...} }
```

## dev

* npm run c
* npm run ct
