const { WalletConnectAdapter } = require('@tronweb3/tronwallet-adapters');

module.exports = walletconnect = (provider) => {

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
            explorerExcludedWalletIds: "ALL",
            explorerRecommendedWalletIds: [
                '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
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
        name: 'WalletConnect (Only Trust Wallet)',
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