class Coin {

    /**
     * @var {String} 
     */
    symbol;

    /**
     * @var {String} 
     */
    decimals;

    /**
     * @var {Provider} 
     */
    provider;

    /**
     * @param {Provider} provider 
     */
    constructor(provider) {
        this.provider = provider;
        this.decimals = 6;
        this.symbol = 'TRX';
    }

    /**
     * @returns {String}
     */
    getSymbol() {
        return this.symbol;
    }

    /**
     * @returns {Integer}
     */
    getDecimals() {
        return this.decimals;
    }
    
    /**
     * @param {String} address
     * @returns {String}
     */
    async getBalance(address) {
        return parseFloat(this.provider.web3.fromSun(await this.provider.web3.trx.getBalance(address)));
    }

    /**
     * @param {String} from
     * @param {String} to
     * @param {Float|Integer} amount
     * @returns {Object}
     */
    createTx(from, to, amount) {
        return this.provider.web3.transactionBuilder.sendTrx(to, amount, from);
    }

    /**
     * @param {String} from
     * @param {String} to 
     * @param {Float|Integer} amount 
     * @returns {String|Object}
     */
    transfer(from, to, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                if (parseFloat(amount) > await this.getBalance(from)) {
                    return reject('insufficient-balance');
                }

                if (parseFloat(amount) < 0) {
                    return reject('transfer-amount-error');
                }

                amount = this.provider.web3.toSun(amount);

                return resolve(await this.createTx(from, to, amount));
            } catch (error) {
                return reject(error);
            }
        });
    }
}

module.exports = Coin;