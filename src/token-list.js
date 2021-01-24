export default class TokenList {
  /**
   * @param {String} name
   * @param {String} network
   */
  constructor(name, network, iconStore) {
    if (!name) name = 'uniswap'
    if (!network) network = 'mainnet'

    this.network = network
    this.name = name

    return this.getList()
  }

  async getList(name, network) {
    if (!name) name = this.name
    if (!network) network = this.network
    const importee = await import(`./build/tokens/${network}/${name}.json`)
    return importee.default
  }
}
