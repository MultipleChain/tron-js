const { TokenPocketAdapter } = require('@tronweb3/tronwallet-adapter-tokenpocket');

module.exports = () => {
    
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
        deepLink: 'tpdapp://open?params=' + JSON.stringify({
            "url": "{siteUrl}", 
            "chain": "Tron",
            "source": "{siteUrl}",
        }),
        download: 'https://www.tokenpocket.pro/en/download/app',
        isDetected: () => Boolean(window.tokenpocket && window.tokenpocket.tron)
    }
}