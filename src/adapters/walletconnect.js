const { WalletConnectAdapter } = require('../tronwallet-adapter-walletconnect/lib/esm/index');

module.exports = (provider) => {

    network = provider.testnet ? 'Nile' : 'Mainnet';
    
    const wallet = new WalletConnectAdapter({
        network,
        options: {
            relayUrl: 'wss://relay.walletconnect.com',
            projectId: provider.wcProjectId,
        },
        qrcodeModalOptions: { 
            mobileLinks: [
                "trust"
            ],
            desktopLinks: [
                // 'zerion', 
                // 'ledger'
            ]
        }
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
            .forEach(x => localStorage.removeItem(x));
            localStorage.removeItem('walletconnect');
            localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
            document.cookie = 'wl-connected' + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        },
    }
}