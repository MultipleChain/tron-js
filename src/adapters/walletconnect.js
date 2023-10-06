const { WalletConnectAdapter } = require('@tronweb3/tronwallet-adapters');

module.exports = walletconnect = (provider) => {

    Object.keys(localStorage)
    .filter(x => x.startsWith('wc@2'))
    .forEach(x => localStorage.removeItem(x))
    network = provider.testnet ? 'Nile' : 'Mainnet';
    
    const wallet = new WalletConnectAdapter({
        network,
        options: {
            relayUrl: 'wss://relay.walletconnect.com',
            projectId: provider.wcProjectId,
        },
        web3ModalConfig: {
            themeVariables: {
                '--w3m-z-index': 999999999999,
            },
            themeMode: provider.wcThemeMode,
            explorerRecommendedWalletIds: [
                '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
                '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
                '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
                '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66',
                '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709',
                '7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26'
            ],
        },
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
        key: 'walletconnect',
        name: 'WalletConnect',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        removeOldConnection: () => {
            Object.keys(localStorage)
            .filter(x => x.startsWith('wc@2'))
            .forEach(x => localStorage.removeItem(x))
        },
    }
}