const { TokenPocketAdapter } = require('@tronweb3/tronwallet-adapters');

module.exports = tokenpocket = (provider) => {
    
    const wallet = new TokenPocketAdapter();

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.connect()
                .then(() => {
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
        key: 'tokenpocket',
        name: 'TokenPocket',
        supports: [
            'mobile'
        ],
        connect,
        deepLink: 'tpdapp://open?param=' + JSON.stringify({
            "url": "{siteUrl}", 
            "chain": "Tron",
            "source": "{siteUrl}",
        }),
        download: 'https://www.tronlink.org/dlDetails/',
        detected : Boolean(typeof window.tronLink != 'undefined')
    }
}