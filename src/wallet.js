const utils = require('./utils');
const getAdapter = require('./get-adapter');

class Wallet {

    /**
     * @var {Object}
     */
    adapter;

    /**
     * @var {Object}
     */
    wallet;
    
    /**
     * @var {Object}
     */
    provider;
    
    /**
     * @var {String}
     */
    connectedAccount;
    /**
     * @param {Object} provider 
     */
    constructor(adapter, provider) {
        this.provider = provider;
        this.setAdapter(adapter);
    }

    /**
     * @param {String} adapter 
     */
    setAdapter(adapter) {
        this.adapter = getAdapter(adapter, this.provider);
    }

    /**
     * @returns {String}
     */
    getKey() {
        return this.adapter.key;
    }

    /**
     * @returns {String}
     */
    getName() {
        return this.adapter.name;
    }

    /**
     * @returns {String}
     */
    getSupports() {
        return this.adapter.supports;
    }

    /**
     * @returns {String}
     */
    getDeepLink() {
        return this.adapter.deepLink;
    }

    /**
     * @returns {String}
     */
    getDownloadLink() {
        return this.adapter.download;
    }

    /**
     * @returns {Boolean}
     */
    isDetected() {
        return this.adapter.detected;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.adapter.connect()
            .then(async wallet => {
                if (this.provider.network.id != (await wallet.network()).chainId) {
                    reject('not-accepted-chain');
                } else {
                    this.wallet = wallet;
                    this.provider.setConnectedWallet(this);
    
                    this.connectedAccount = wallet.address;
                    this.connectedNetwork = this.provider.network;
                    resolve(this.connectedAccount);
                }
            })
            .catch(error => {
                utils.rejectMessage(error, reject);
            });
        })
    }

    /**
     * @param transaction 
     * @returns {Promise}
     */
    sendTransaction(transaction) {
        return new Promise(async (resolve, reject) => {
            try {
                let signedTransaction = await this.wallet.signTransaction(transaction);
                let {txid} = await this.provider.web3.trx.sendRawTransaction(signedTransaction);
                return resolve(this.provider.Transaction(txid));
            } catch (error) {
                if (error == "Confirmation declined by user") {
                    return reject('request-rejected');
                }

                return reject(error);
            }
        });
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @param {String} tokenAddress
     * @return {Transaction|Object}
     * @throws {Error}
     */
    tokenTransfer(to, amount, tokenAddress) {
        return new Promise(async (resolve, reject) => {
            try {
                this.validate(to, amount, tokenAddress);
                let token = this.provider.Token(tokenAddress);
                let txObj = await token.transfer(this.connectedAccount, to, amount);

                this.sendTransaction(txObj)
                .then((transaction) => {
                    resolve(transaction);
                })
                .catch((error) => {
                    utils.rejectMessage(error, reject);
                });
            } catch (error) {
                utils.rejectMessage(error, reject);
            }
        });
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @return {Transaction|Object}
     * @throws {Error}
     */
    coinTransfer(to, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                this.validate(to, amount);
                let coin = this.provider.Coin();

                let txObj = await coin.transfer(this.connectedAccount, to, amount);
                
                this.sendTransaction(txObj)
                .then((transaction) => {
                    resolve(transaction);
                })
                .catch((error) => {
                    utils.rejectMessage(error, reject);
                });
            } catch (error) {
                utils.rejectMessage(error, reject);
            }
        });
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @param {String|null} tokenAddress
     * @return {Transaction|Object}
     * @throws {Error}
     */
    transfer(to, amount, tokenAddress = null) {
        if (tokenAddress) {
            return this.tokenTransfer(to, amount, tokenAddress);
        } else {
            return this.coinTransfer(to, amount);
        }
    }

    /**
     * @param {String} address 
     * @return {String}
     */
    addressToHex(address) {
        return this.provider.web3.address.toHex(address);
    }

    /**
     * @param {String} address 
     * @return {String}
     */
    addressFromHex(address) {
        return this.provider.web3.address.fromHex(address);
    }

    /**
     * @param {Array} params 
     * @return {Object}
     */
    contract(...params) {
        return this.provider.web3.contract(...params);
    }

    /**
     * @param {Object} params 
     * @return {Object}
     */
    deployContract(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let transaction = await this.wallet.transactionBuilder.createSmartContract(params, this.connectedAccount);

                let signedTransaction = await this.wallet.trx.sign(transaction);

                let {txid} = await this.wallet.trx.sendRawTransaction(signedTransaction);

                return resolve(this.provider.Transaction(txid));
            } catch (error) {
                if (error == "Confirmation declined by user") {
                    return reject('request-rejected');
                }

                return reject(error);
            }
        });
    }
    
    /**
     * @param  {...any} params 
     * @returns {Mixed}
     */
    async triggerSmartContract(...params) {
        return this.provider.web3.transactionBuilder.triggerSmartContract(...params);
    }
    
    /**
     * @param {String} to
     * @param {Integer} amount
     * @param {String|null} tokenAddress
     * @return {Boolean}
     * @throws {Error}
     */
    validate(to, amount, tokenAddress = null) {
        if (!this.connectedAccount) {
            throw new Error("no-linked-wallet");
        } 

        if (amount <= 0) {
            throw new Error("transfer-amount-error");
        } 

        return true;
    }

    // Events    
    chainChanged(callback) {
        this.wallet.on('chainChanged', (chainHexId) => {
            callback(chainHexId);
        });
    }

    accountsChanged(callback) {
        this.wallet.on('accountsChanged', (accounts) => {
            callback(accounts);
        });
    }

    networkChanged(callback) {
        this.wallet.on('networkChanged', (param) => {
            callback(param);
        });
    }

    readyStateChanged(callback) {
        this.wallet.on('readyStateChanged', (param) => {
            callback(param);
        });
    }
    
    connectEvent(callback) {
        this.wallet.on('connect', (code, reason) => {
            callback(code, reason);
        });
    }
    
    disconnectEvent(callback) {
        this.wallet.on('disconnect', (code, reason) => {
            callback(code, reason);
        });
    }
} 

module.exports = Wallet;