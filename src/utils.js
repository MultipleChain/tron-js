const utils = require('@multiplechain/utils');

module.exports = Object.assign(utils, {
    rejectMessage(error, reject) {
        
        if (error == 'Cannot transfer TRX to the same account') {
            reject('same-account');
        }

        return reject(error);
    }
})