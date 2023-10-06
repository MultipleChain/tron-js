const utils = require('@multiplechain/utils');

module.exports = Object.assign(utils, {
    rejectMessage(error, reject) {
        
        if (error == 'Cannot transfer TRX to the same account') {
            reject('same-account');
        }

        if (typeof error == 'object') {
            if (String(error.message).includes('Confirmation declined by user')) {
                return reject('request-rejected');
            }
        }

        return reject(error);
    }
})