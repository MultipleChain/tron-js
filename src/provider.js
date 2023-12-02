
const TronWeb = require('tronweb');
const utils = require('./utils');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Transaction = require('./entity/transaction');
const { TronLinkAdapter } = require('@tronweb3/tronwallet-adapters');

class Provider {

    /**
     * @var {Object}
     */
    web3;

    /**
     * @var {Boolean}
     */
    testnet = false;

    /**
     * @var {String}
     */
    wcProjectId;

    /**
     * @var {String}
     */
    wcThemeMode = 'light';

    /**
     * @var {Object}
     *  
     */    
    networks = {
        mainnet: {
            id: "0x2b6653dc",
            node: "mainnet",
            name: "TronGrid Mainnet",
            host: "https://api.trongrid.io",
            event: "https://api.trongrid.io",
            explorer: "https://tronscan.org/"
        },
        testnet: {
            id: "0xcd8690dc",
            node: "testnet",
            name: "TronGrid Nile Testnet",
            host: "https://nile.trongrid.io",
            event: "https://event.nileex.io",
            explorer: "https://nile.tronscan.org/"
        }
    }

    /**
     * @var {Object}
     */
    network = {};

    /**
     * @var {Boolean}
     */
    qrPayments = false;
    
    /**
     * @var {Object}
     */
    supportedWallets;

    /**
     * @var {Object}
     */
    connectedWallet;

    /**
     * @param {Object} options 
     */
    constructor(options) {
        this.testnet = options.testnet;
        this.wcProjectId = options.wcProjectId;
        this.wcThemeMode = options.wcThemeMode || 'light';

        this.network = this.networks[this.testnet ? 'testnet' : 'mainnet'];
        if (!this.testnet && options.customRpc) {
            this.network.host = options.customRpc;
        }

        this.web3 = new TronWeb({
            fullHost: this.network.host,
            solidityNode: this.network.host,
            eventServer: this.network.event,
        });
    }

    /**
     * @returns {Promise}
     */
    connectWallet(adapter) {
        return new Promise(async (resolve, reject) => {
            let detectedWallets = this.getDetectedWallets();
            if (detectedWallets[adapter]) {
                let wallet = detectedWallets[adapter];
                wallet.connect()
                .then(() => {
                    resolve(wallet);
                })
                .catch(error => {
                    utils.rejectMessage(error, reject);
                });
            } else {
                reject('wallet-not-found');
            }
        });
    }

    /**
     * @param {Object} wallet 
     */
    setConnectedWallet(wallet) {
        this.connectedWallet = wallet;
    }

    /**
     * @param {Array|null} filter 
     * @returns {Array}
     */
    getSupportedWallets(filter) {
        if (!this.supportedWallets) {
            const Wallet = require('./wallet');
            
            this.supportedWallets = {
                tronlink: new Wallet('tronlink', this),
                tokenpocket: new Wallet('tokenpocket', this),
                bitget: new Wallet('bitget', this),
                okx: new Wallet('okx', this),
            };

            if (this.wcProjectId) {
                this.supportedWallets['walletconnect'] = new Wallet('walletconnect', this);
            }
        }

        return Object.fromEntries(Object.entries(this.supportedWallets).filter(([key]) => {
            return !filter ? true : filter.includes(key);
        }));
    }

    /**
     * @param {Array|null} filter 
     * @returns {Array}
     */
    getDetectedWallets(filter) {
        let detectedWallets = this.getSupportedWallets(filter);
        return Object.fromEntries(Object.entries(detectedWallets).filter(([key, value]) => {
            return value.isDetected() == undefined ? true : value.isDetected();
        }));
    }

    /**
     * @returns {Coin}
     */
    Coin() {
        return new Coin(this);
    }

    /**
     * @param {String} address 
     * @returns {Token}
     */
    Token(address) {
        return new Token(address, this);
    }

    /**
     * @param {String} hash 
     * @returns {Transaction}
     */
    Transaction(hash) {
        return new Transaction(hash, this);
    }
}

module.exports = Provider;