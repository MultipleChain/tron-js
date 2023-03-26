const utils = require('./utils');

class Wallet {

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
    constructor(provider) {
        this.provider = provider;
    }

    /**
     * @returns {String}
     */
    getKey() {
        return 'tronlink';
    }

    /**
     * @returns {String}
     */
    getName() {
        return 'TronLink';
    }

    /**
     * @returns {String}
     */
    getType() {
        return 'browser';
    }

    /**
     * @returns {String}
     */
    getDeepLink() {
        return 'tronlinkoutside://pull.activity?param={}';
    }

    /**
     * @returns {String}
     */
    getDownloadLink() {
        return 'https://www.tronlink.org/';
    }

    /**
     * @returns {Boolean}
     */
    isTronLink() {
        return window.tronLink;
    }

    connect() {
        return new Promise(async (resolve, reject) => {
            if (!this.isTronLink()) {
                return reject('wallet-not-found');
            }

            let result = await tronLink.request({method: 'tron_requestAccounts'});
            
            if (!result) {
                return reject('locked-wallet');
            }

            if (result.code == 4001) {
                return reject('request-rejected');
            }

            if (tronLink.tronWeb.fullNode.host != this.provider.network.host) {
                return reject('not-accepted-chain');
            }

            return resolve(this.connectedAccount = tronLink.tronWeb.defaultAddress.base58);
        });
    }

    /**
     * @param transaction 
     * @returns {Promise}
     */
    sendTransaction(transaction) {
        return new Promise(async (resolve, reject) => {
            try {
                let signedTransaction = await tronLink.tronWeb.trx.sign(transaction);
                let {txid} = await tronLink.tronWeb.trx.sendRawTransaction(signedTransaction);
                return resolve(txid);
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

                token.transfer(this.connectedAccount, to, amount)
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
                
                coin.transfer(this.connectedAccount, to, amount)
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
        return tronLink.tronWeb.address.toHex(address);
    }

    /**
     * @param {String} address 
     * @return {String}
     */
    addressFromHex(address) {
        return tronLink.tronWeb.address.fromHex(address);
    }

    /**
     * @param {Array} params 
     * @return {Object}
     */
    contract(...params) {
        return tronLink.tronWeb.contract(...params);
    }

    /**
     * @param {Object} params 
     * @return {Object}
     */
    deployContract(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let transaction = await tronLink.tronWeb.transactionBuilder.createSmartContract(params, this.connectedAccount);

                let signedTransaction = await tronLink.tronWeb.trx.sign(transaction);

                let {txid} = await tronLink.tronWeb.trx.sendRawTransaction(signedTransaction);

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
        return tronLink.tronWeb.transactionBuilder.triggerSmartContract(...params);
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
} 

module.exports = Wallet;