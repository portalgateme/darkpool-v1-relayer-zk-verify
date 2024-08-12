const pgDarkPoolAerodromeSwapAbi = require('../../abis/pgDarkPoolAerodromeSwapAssetManager.abi.json')

const {
    pgDarkPoolAerodromeSwapAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { calculateFeesForOneToken } = require('../modules/fees')


class AerodromSwapWorker extends BaseWorker {

    getContractCall(contract, data, gasRefund) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            nullifier: data.inNullifier,
            assetIn: data.inAsset,
            amountIn: data.inAmount,
            route: data.routes,
            routeHash: data.routeHash,
            minExpectedAmountOut: data.minExpectedAmountOut,
            deadline: data.deadline,
            noteFooter: data.outNoteFooter,
            relayer: data.relayer,
            gasRefund: gasRefund,
        }
        calldata = contract.methods.aerodromeSwap(data.proof, param)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.gasRefund)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolAerodromeSwapAbi.abi, pgDarkPoolAerodromeSwapAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const { gasFeeInToken, serviceFeeInToken } = await calculateFeesForOneToken(gasFee, data.inAsset, data.inAmount)
        if (gasFeeInToken + serviceFeeInToken > BigInt(data.inAmount)) {
            throw new Error('Insufficient amount to pay fees')
        }
        const contractCall = this.getContractCall(contract, data, gasFeeInToken)

        return {
            to: contract._address,
            data: contractCall.encodeABI(),
            gasLimit: gasLimits['DEFI_WITH_EXTRA'],
        }
    }
}

module.exports = {
    AerodromSwapWorker
}