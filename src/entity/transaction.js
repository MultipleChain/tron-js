const utils = require('../utils');
const TxDecoder = require('@beycandeveloper/tron-tx-decoder');

class Transaction {

    /**
     * @var {Object}
     */
    provider;

    /**
     * @var {String} 
     */
    hash;

    /**
     * @var {Object} 
     */
    data;

    /**
     * @var {Number}
     */
    timer;

    /**
     * @param {String} hash 
     * @param {Object} provider
     */
    constructor(hash, provider) {
        this.hash = hash;
        this.provider = provider;
    }

    /**
     * @returns {String}
     */
    getHash() {
        return this.hash;
    }

    /**
     * @param {Number} timer 
     */
    setTimer(timer) {
        this.timer = timer;
    }

    /**
     * @returns {Object}
     */
    async getData() {
        try {
            this.data = await this.provider.web3.trx.getTransaction(this.hash);
            this.data.info = await this.provider.web3.trx.getTransactionInfo(this.hash);
        } catch (error) {
            throw new Error('data-request-failed');
        }

        return this.data;
    }

    /**
     * @returns {Object}
     */
    async decodeInput() {
        let decoder = new TxDecoder(this.provider.network.host);
        let {decodedInput} = await decoder.decodeInputById(this.hash);
        
        let receiver = this.provider.web3.address.fromHex(decodedInput[0]);
        let amount = decodedInput[1]._hex;
        
        return { receiver, amount };
    }

    /**
     * @returns {Number}
     */
    async getConfirmations() {
        try {
            let data = await this.getData();
            let currentBlock = await this.provider.web3.trx.getBlockNumber();
            if (data.info && data.info.blockNumber === null) return 0;
            let blockNumber = utils.toDec(data.info.blockNumber, 0);
            let confirmations = currentBlock - blockNumber;
            return confirmations < 0 ? 0 : confirmations;
        } catch (error) {}
    }

    /**
     * @param {Number} confirmations 
     * @param {Number} timer 
     * @returns {Number}
     */
    confirmTransaction(confirmations = 10, timer = 1) {
        return new Promise((resolve, reject) => {
            try {
                this.intervalConfirm = setInterval(async () => {
                    const txConfirmations = await this.getConfirmations(this.hash)
        
                    if (txConfirmations >= confirmations) {
                        clearInterval(this.intervalConfirm);
                        return resolve(txConfirmations);
                    }
                }, (timer*1000));
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * @param {Number} timer 
     * @returns {Boolean}
     */
    async validate(timer = 1) {
        timer = this.timer || timer;
        try {
            await this.getData();
            let result = null;

            if (this.data.info && this.data.info.blockNumber) {
                if (this.data.ret[0].contractRet == 'REVERT') {
                    result = false;
                } else if (this.data.info.result == 'FAILED') {
                    result = false;
                } else {
                    result = true;
                }
            }

            
            if (typeof result == 'boolean') {
                return result;
            }

            await new Promise(r => setTimeout(r, (timer*1000)));

            return this.validate(timer);
        } catch (error) {
            if (error.message == 'data-request-failed') {
                return this.validate(timer);
            } else {
                throw error;
            }
        }
    }

    /**
     * @param {String} receiver 
     * @param {Number} amount 
     * @param {String} address 
     * @returns {Boolean}
     */
    async verifyTokenTransferWithData(receiver, amount, address) {
        if (await this.validate()) {
            let decodedInput = await this.decodeInput();
            let token = await this.provider.web3.contract().at(address);
            let decimals = parseFloat((await token.decimals().call()).toString(10));

            let data = {
                receiver: String(decodedInput.receiver).toLowerCase(),
                amount: utils.toDec(decodedInput.amount, decimals)
            };
            
            if (data.receiver == receiver.toLocaleLowerCase() && String(data.amount) == String(amount)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * @param {String} receiver 
     * @param {Number} amount 
     * @returns {Boolean}
     */
    async verifyCoinTransferWithData(receiver, amount) {
        if (await this.validate()) {
            let params = this.data.raw_data.contract[0].parameter.value;
            let data = {
                receiver: String(this.provider.web3.address.fromHex(params.to_address)).toLowerCase(),
                amount: parseFloat(this.provider.web3.fromSun(params.amount))
            };

            if (data.receiver == receiver.toLocaleLowerCase() && String(data.amount) == String(amount)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * @param {String} config
     * @returns {String}
     */
    async verifyTransferWithData(config) {
        if (!config.tokenAddress) {
            return this.verifyCoinTransferWithData(config.receiver, config.amount);
        } else {
            return this.verifyTokenTransferWithData(config.receiver, config.amount, config.tokenAddress);
        }
    }

    /**
     * @returns {String}
     */
    getUrl() {
        let explorerUrl = this.provider.network.explorer;
        explorerUrl += explorerUrl.endsWith('/') ? '' : '/';
        explorerUrl += '#/transaction/'+this.hash;
        return explorerUrl;
    }

}

module.exports = Transaction;