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
  constructor(name, network, iconStore) {
    if (!name) name = 'uniswap';
    if (!network) network = 'mainnet';

    this.network = network;
    this.name = name;

    return this.getList()
  }

  async getList(name, network) {
    if (!name) name = this.name;
    if (!network) network = this.network;
    const importee = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(`./build/tokens/${network}/${name}.json`)); });
    return importee.default
  }
}

module.exports = TokenList;
