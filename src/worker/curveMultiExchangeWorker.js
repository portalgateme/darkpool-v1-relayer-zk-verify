const pgDarkPoolCurveMultiExchangeABI = require('../../abis/pgDarkPoolCurveMultiExchange.abi.json')
const {
    pgDarkPoolCurveMultiExchangeAssetManager,
    gasLimits,
    gasUnitFallback,
} = require('../config/config')
const { jobType } = require('../config/constants')
const { calculateFeesForOneToken } = require('../modules/fees')

const { BaseWorker } = require('./baseWorker')

class CurveMultiExchangeWorker extends BaseWorker {

    getContractCall(contract, data, refund) {
        let calldata

        const exchangeArgs = {
            merkleRoot: data.merkleRoot,
            nullifier: data.nullifier,
            assetIn: data.assetIn,
            amountIn: data.amountIn,
            route: data.routes,
            swapParams: data.swapParams,
            pools: data.pools,
            routeHash: data.routeHash,
            assetOut: data.assetOut,
            minExpectedAmountOut: data.minExpectedAmountOut,
            noteFooter: data.noteFooterOut,
            relayer: data.relayer,
            gasRefund: refund,
        }
        calldata = contract.methods.curveMultiExchange(
            data.proof,
            exchangeArgs,
        )
        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.gasRefund)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolCurveMultiExchangeABI.abi, pgDarkPoolCurveMultiExchangeAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const {gasFeeInToken,serviceFeeInToken} = await calculateFeesForOneToken(gasFee, data.assetIn, data.amountIn)
        if(gasFeeInToken + serviceFeeInToken > BigInt(data.amountIn)){
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
    CurveMultiExchangeWorker
}