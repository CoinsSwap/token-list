'use strict';

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

class TokenList {
  /**
   * @param {String} name
   * @param {String} network
   */
  constructor(name, network, iconPrefix) {
    if (!name) name = 'uniswap';
    if (!network) network = 'mainnet';
    if (!iconPrefix) iconPrefix = 'https://raw.githubusercontent.com/CoinsSwap/token-list/main/build/icons';

    this.network = network;
    this.name = name;
    this.iconPrefix = iconPrefix;

    return this.getList()
  }

  transformTokens(tokens) {
    for (const key of Object.keys(tokens)) {
      tokens[key].icon = {
        black: `${this.iconPrefix}/black/${tokens[key].icon}`,
        color: `${this.iconPrefix}/color/${tokens[key].icon}`,
        white: `${this.iconPrefix}/white/${tokens[key].icon}`
      };
    }

    return tokens
  }

  async getList(name, network, prefix) {
    if (!name) name = this.name;
    if (!network) network = this.network;

    if (globalThis.window) {
      prefix = prefix || 'https://raw.githubusercontent.com/CoinsSwap/token-list/main/build/tokens';
      const response = await fetch(`${prefix}/${network}/${name}.json`);
      return this.transformTokens(await response.json())
    }
    prefix = prefix || './build/tokens';
    const importee = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(`${prefix}/${network}/${name}.json`)); });
    return this.transformTokens(importee.default)
  }
}

module.exports = TokenList;
