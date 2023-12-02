const utils = require('@multiplechain/utils');

module.exports = Object.assign(utils, {
    rejectMessage(error, reject) {
        console.log(error)
        
        if (error == 'Cannot transfer TRX to the same account') {
            return reject('same-account');
        }

        if (typeof error == 'object') {
            if (
                error.name == 'WalletSignTransactionError' ||
                String(error.message).includes('Confirmation declined by user') ||
                String(error.message).includes('User rejected the request.') ||
                String(error.message).includes('The user rejected connection.') || 
                String(error.message).includes('Modal is closed.') ||
                String(error.message).includes('User canceled') ||
                String(error.message).includes('User rejected') 
            ) {
                return reject('request-rejected');
            } else if (String(error.message).includes('The wallet is not found.')) {
                return reject('wallet-not-found');
            } else if (String(error.message).includes('User disapproved requested chains')) {
                return reject('not-accepted-chain');
            } else if (error.message.includes('The QR window is closed.')) {
                return reject('closed-walletconnect-modal');
            }
        }

        return reject(error);
    }
})