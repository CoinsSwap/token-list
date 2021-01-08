# token-list
> The default token list for CoinsSwap.

## Why?

Is it me or does like every list have missing icons?
The internet is overloaded enough, stop trying to load stuff thats moved or gone.

## How?

W'll create a service which checks token health (aka does it have a logo) & update the list accordingly.
* first check if the token is available in [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons)
* if none is found, a generic icon will be applied

## install
```sh
npm i --save @coinsswap/token-list
```

## usage
```js
import list from '@coinsswap/token-list'
```

## dev

* npm run c
* npm run ct
