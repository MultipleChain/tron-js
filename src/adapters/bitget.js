const { BitKeepAdapter } = require('@tronweb3/tronwallet-adapters');

module.exports = bitget = () => {
    
    const wallet = new BitKeepAdapter();

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
        key: 'bitget',
        name: 'Bitget Wallet',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        deepLink: 'https://bkcode.vip?action=dapp&url={siteUrl}',
        download: 'https://web3.bitget.com/en/wallet-download?type=3',
        isDetected: () => Boolean(window.bitkeep && window.bitkeep.tronLink)
    }
}