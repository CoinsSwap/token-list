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

  async getList(name, network, prefix) {
    if (!name) name = this.name;
    if (!network) network = this.network;

    if (globalThis.window) {
      prefix = prefix || 'https://raw.githubusercontent.com/CoinsSwap/token-list/main/build/tokens';
      const response = await fetch(`${prefix}/${network}/${name}.json`);
      return response.json()
    }
    prefix = prefix || './build/tokens';
    const importee = await import(`${prefix}/${network}/${name}.json`);
    return importee.default
  }
}

export default TokenList;
