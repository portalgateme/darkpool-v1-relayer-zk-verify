const pgDarkPoolAerodromeAddLiquidityAbi = require('../../abis/pgDarkPoolAerodromeAddLiquidityAssetManager.abi.json')

const {
    pgDarkPoolAerodromeAddLiquidityAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { calculateFeeForTokens } = require('../modules/fees')

class AerodromAddLiquidityWorker extends BaseWorker {

    getContractCall(contract, data, refundToken1, refundToken2) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            nullifiers: [data.inNullifier1, data.inNullifier2],
            assets: [data.inAsset1, data.inAsset2],
            amounts: [data.inAmount1, data.inAmount2],
            pool: data.pool,
            stable: data.stable,
            amountsMin: [data.amount1Min, data.amount2Min],
            deadline: data.deadline,
            noteFooters: [data.outChangeFooter1, data.outChangeFooter2, data.outNoteFooter],
            relayer: data.relayer,
            gasRefund: [refundToken1, refundToken2]
        }
        calldata = contract.methods.aerodromeAddLiquidity(data.proof, param)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.refundToken1, data.refundToken2)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolAerodromeAddLiquidityAbi.abi, pgDarkPoolAerodromeAddLiquidityAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const fees = await calculateFeeForTokens(gasFee, [data.inAsset1, data.inAsset2], [data.inAmount1, data.inAmount2])
        if (fees[0].gasFeeInToken + fees[0].serviceFeeInToken > BigInt(data.inAmount1)
            || fees[1].gasFeeInToken + fees[1].serviceFeeInToken > BigInt(data.inAmount2)) {
            throw new Error('Insufficient amount to pay fees')
        }
        const contractCall = this.getContractCall(contract, data, fees[0].gasFeeInToken, fees[1].gasFeeInToken)

        return {
            to: contract._address,
            data: contractCall.encodeABI(),
            gasLimit: gasLimits['DEFI_WITH_EXTRA'],
        }
    }
}

module.exports = {
    AerodromAddLiquidityWorker
}