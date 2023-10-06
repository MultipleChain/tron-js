const { TronLinkAdapter } = require('@tronweb3/tronwallet-adapters');

module.exports = okx = (provider) => {
    
    const wallet = new TronLinkAdapter({
        checkTimeout: 2000,
    });

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.connect()
                .then(async () => {
                    resolve(wallet);
                })
                .catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    return {
        key: 'okx',
        name: 'Okx Wallet',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        deepLink: 'okx://wallet/dapp/details?dappUrl={siteUrl}',
        download: 'https://www.okx.com/download',
        detected : Boolean(window.okxwallet && window.okxwallet.tronLink)
    }
}