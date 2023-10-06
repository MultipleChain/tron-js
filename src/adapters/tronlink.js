const { TronLinkAdapter } = require('@tronweb3/tronwallet-adapters');

module.exports = tronlink = (provider) => {
    
    const wallet = new TronLinkAdapter();

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.connect()
                .then((response) => {
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
        key: 'tronlink',
        name: 'TronLink',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        deepLink: 'tronlinkoutside://pull.activity?param=' + JSON.stringify({
            "url": "{siteUrl}", 
            "action": "open",
            "protocol": "tronlink",
            "version": "1.0"
        }),
        download: 'https://www.tronlink.org/dlDetails/',
        detected : Boolean(typeof window.tronLink != 'undefined')
    }
}