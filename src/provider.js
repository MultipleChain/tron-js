
const utils = require('./utils');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Transaction = require('./entity/transaction');

class Provider {

    /**
     * @var {Boolean}
     */
    testnet = false;

    /**
     * @var {Object}
     *  
     */    
    networks = {
        mainnet: {
            node: "mainnet",
            name: "TronGrid Mainnet",
            host: "https://api.trongrid.io",
            explorer: "https://tronscan.io/"
        },
        testnet: {
            node: "testnet",
            name: "Nile Testnet",
            host: "https://api.nileex.io",
            explorer: "https://nile.tronscan.org/"
        }
    }

    /**
     * @var {Object}
     */
    network = {};

    /**
     * @var {Object}
     */
    detectedWallets = [];

    /**
     * @param {Boolean} testnet 
     */
    constructor(testnet = false) {
        this.testnet = testnet;

        this.network = this.networks[this.testnet ? 'testnet' : 'mainnet'];

        this.detectWallets();
    }

    /**
     * @returns {Promise}
     */
    connectWallet() {
        return new Promise(async (resolve, reject) => {
            let wallet = this.detectedWallets['tronlink']
            wallet.connect()
            .then(() => {
                resolve(wallet);
            })
            .catch(error => {
                utils.rejectMessage(error, reject);
            });
        });
    }

    /**
     * @param {Array} filter 
     * @returns {Array}
     */
    getDetectedWallets(filter) {
        return Object.fromEntries(Object.entries(this.detectedWallets).filter(([key]) => {
            return filter.includes(key);
        }));
    }

    detectWallets() {
        if (typeof window != 'undefined') {
            if (window.tronLink) {
                const Wallet = require('./wallet');
                this.detectedWallets['tronlink'] = new Wallet(this);
            }
        }
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