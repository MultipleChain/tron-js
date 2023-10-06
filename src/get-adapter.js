const adapters = {
    tronlink: require('./adapters/tronlink'),
}

/**
 * @param {String} adapter
 * @param {Object} provider
 */
module.exports = getAdapter = (adapter, provider) => {
    return adapters[adapter](provider);
}