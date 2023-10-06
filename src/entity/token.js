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

    token;

    /**
     * @param {String} address 
     * @param {Provider} provider
     */
    constructor(address, provider) {
        this.address = address;
        this.provider = provider;

        this.setToken();
    }

    async setToken() {
        if (!this.token) {
            this.token = await this.provider.web3.contract().at(this.address);
        }
        this.provider.web3.setAddress(this.address);
        return this.token;
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
        await this.setToken();
        return await this.token.name().call();
    }

    /**
     * @returns {String|Object}
     */
    async getSymbol() {
        await this.setToken();
        return await this.token.symbol().call();
    }

    /**
     * @returns {String|Object}
     */
    async getDecimals() {
        await this.setToken();
        return parseFloat((await this.token.decimals().call()).toString(10));
    }

    /**
     * @returns {Float|Object}
     */
    async getTotalSupply() {
        await this.setToken();
        let totalSupply = parseFloat((await tthis.oken.totalSupply().call()).toString(10));
        return utils.toDec(totalSupply, await this.getDecimals());
    }

    
    /**
     * @param {String} address 
     * @returns {Number}
     */
    async getBalance(address) {
        await this.setToken();
        let balance = parseFloat((await this.token.balanceOf(address).call()).toString(10));
        return utils.toDec(balance, await this.getDecimals());
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

                let transactionObject = await this.provider.web3.transactionBuilder.triggerSmartContract(
                    this.address, 
                    "transfer(address,uint256)", 
                    options, 
                    parameter,
                    from
                );
                
                return resolve(transactionObject.transaction);
            } catch (error) {
                console.log(error)
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
    
                let transactionObject = await this.provider.web3.transactionBuilder.triggerSmartContract(
                    this.address, 
                    "approve(address,uint256)", 
                    options, 
                    parameter,
                    from
                );
    
                resolve(transactionObject.transaction);
            } catch (error) {
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
        let token = await this.provider.web3.contract().at(this.address);
        let allowance = parseFloat((await token.allowance(owner, spender).call()).toString(10));
        return utils.toDec(allowance, await this.getDecimals());
    }
}

module.exports = Token;