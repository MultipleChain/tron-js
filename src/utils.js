const utils = require('@multiplechain/utils');

module.exports = Object.assign(utils, {
    rejectMessage(error, reject) {
        
        if (error == 'Cannot transfer TRX to the same account') {
            reject('same-account');
        }

        if (typeof error == 'object') {
            if (
                String(error.message).includes('Confirmation declined by user') ||
                String(error.message).includes('User rejected the request.')
            ) {
                return reject('request-rejected');
            } else if (String(error.message).includes('The wallet is not found.')) {
                return reject('wallet-not-found');
            } else if (String(error.message).includes('User disapproved requested chains')) {
                return reject('not-accepted-chain');
            }
        }

        return reject(error);
    }
})