
const TronWeb = require('tronweb');
const utils = require('./utils');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Transaction = require('./entity/transaction');

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
     * @var {Object}
     *  
     */    
    networks = {
        mainnet: {
            node: "mainnet",
            name: "TronGrid Mainnet",
            host: "https://api.trongrid.io",
            explorer: "https://tronscan.org/"
        },
        testnet: {
            node: "testnet",
            name: "TronGrid Nile Testnet",
            host: "https://nile.trongrid.io",
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
     * @var {Object}
     */
    connectedWallet;

    /**
     * @param {Boolean} testnet 
     */
    constructor(testnet = false) {
        this.testnet = testnet;

        this.network = this.networks[this.testnet ? 'testnet' : 'mainnet'];

        this.web3 = new TronWeb({
            fullHost: this.network.host,
            solidityNode: this.network.host,
        });

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
     * @param {Object} wallet 
     */
    setConnectedWallet(wallet) {
        this.connectedWallet = wallet;
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
     * @param {String} receiver 
     * @param {Number} amount
     * @returns {Object}
     */
    async getLastTransactionByReceiver(receiver, tokenAddress) {
        
        let tx = await fetch(this.network.host + '/v1/accounts/' + receiver + '/transactions?limit=1&only_to=true&search_internal=false')
        .then(response => response.json());
        tx = tx.data[0];

        console.log(tx);

        if (!tx) {
            return {
                hash: null,
                amount: 0
            }
        }

        let hash = tx.txID;

        let amount;
        if (tokenAddress) {
            tx = this.Transaction(hash);
            let data = await tx.decodeInput();
            this.web3.setAddress(tokenAddress);
            let token = await this.web3.contract().at(tokenAddress);
            let decimals = parseFloat((await token.decimals().call()).toString(10));
            amount = utils.toDec(data.amount, decimals);
        } else {
            let params = tx.raw_data.contract[0].parameter.value;
            amount = parseFloat(this.web3.fromSun(params.amount));
        }

        return {
            hash,
            amount
        };
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