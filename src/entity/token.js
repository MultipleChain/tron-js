const utils = require('../utils');

class Token {
    
    /**
     * @var {String} 
     */
    address;

    /**
     * @var {Object} 
     */
    provider;

    /**
     * @param {String} address 
     * @param {Provider} provider
     */
    constructor(address, provider) {
        this.address = address;
        this.provider = provider;
    }

    /**
     * @returns {String}
     */
    getAddress() {
        return this.address;
    }
    
    /**
     * @returns {String|Object}
     */
    async getName() {
        let token = await tronLink.tronWeb.contract().at(this.address);
        return await token.name().call();
    }

    /**
     * @returns {String|Object}
     */
    async getSymbol() {
        let token = await tronLink.tronWeb.contract().at(this.address);
        return await token.symbol().call();
    }

    /**
     * @returns {String|Object}
     */
    async getDecimals() {
        let token = await tronLink.tronWeb.contract().at(this.address);
        return parseFloat((await token.decimals().call()).toString(10));
    }

    /**
     * @returns {Float|Object}
     */
    async getTotalSupply() {
        let token = await tronLink.tronWeb.contract().at(this.address);
        let totalSupply = parseFloat((await token.totalSupply().call()).toString(10));
        return utils.toDec(totalSupply, await this.getDecimals());
    }

    
    /**
     * @param {String} address 
     * @returns {Number}
     */
    async getBalance(address) {
        let token = await tronLink.tronWeb.contract().at(this.address);
        let decimals = parseFloat((await token.decimals().call()).toString(10));
        let balance = parseFloat((await token.balanceOf(address).call()).toString(10));

        return utils.toDec(balance, decimals);
    }

    /**
     * @param {String} from
     * @param {String} to
     * @param {Integer} amount
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

                let parameter = [
                    {
                        type:'address',
                        value: to
                    },
                    {
                        type:'uint256',
                        value: utils.toHex(amount, await this.getDecimals())
                    }
                ];

                let options = {
                    feeLimit: 100000000                    
                };

                let transactionObject = await tronLink.tronWeb.transactionBuilder.triggerSmartContract(
                    this.address, 
                    "transfer(address,uint256)", 
                    options, 
                    parameter,
                    from
                );
                
                let signedTransaction = await tronLink.tronWeb.trx.sign(transactionObject.transaction);

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
     * @param {String} from
     * @param {String} spender
     * @param {Number} amount
     * @returns {Boolean}
     */
    approve(from, spender, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                let parameter = [
                    {
                        type:'address',
                        value: spender
                    },
                    {
                        type:'uint256',
                        value: utils.toHex(amount, await this.getDecimals())
                    }
                ];
    
                let options = {
                    feeLimit: 100000000                    
                };
    
                let transactionObject = await tronLink.tronWeb.transactionBuilder.triggerSmartContract(
                    this.address, 
                    "approve(address,uint256)", 
                    options, 
                    parameter,
                    from
                );
    
                let signedTransaction = await tronLink.tronWeb.trx.sign(transactionObject.transaction);
    
                let {txid} = await tronLink.tronWeb.trx.sendRawTransaction(signedTransaction);
    
                return resolve(this.provider.Transaction(txid));
            } catch (error) {
                if (error == "Confirmation declined by user") {
                    return reject('request-rejected');
                }

                return reject(error)
            }
        });
    }

    /**
     * @param {String} owner
     * @param {String} spender
     * @returns {Boolean}
     */
    async allowance(owner, spender) {
        let token = await tronLink.tronWeb.contract().at(this.address);
        let allowance = parseFloat((await token.allowance(owner, spender).call()).toString(10));
        return utils.toDec(allowance, await this.getDecimals());
    }
}

module.exports = Token;