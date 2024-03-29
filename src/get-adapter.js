const adapters = {
    tronlink: require('./adapters/tronlink'),
    tokenpocket: require('./adapters/tokenpocket'),
    bitget: require('./adapters/bitget'),
    okx: require('./adapters/okx'),
    walletconnect: require('./adapters/walletconnect'),
}

/**
 * @param {String} adapter
 * @param {Object} provider
 */
module.exports = getAdapter = (adapter, provider) => {
    return adapters[adapter](provider);
}