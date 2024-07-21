const pgDarkPoolAerodromeRemoveLiquidityAbi = require('../../abis/pgDarkPoolAerodromeRemoveLiquidityAssetManager.abi.json')

const {
    pgDarkPoolAerodromeRemoveLiquidityAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { calculateFeeForTokens } = require('../modules/fees')


class AerodromRemoveLiquidityWorker extends BaseWorker {

    getContractCall(contract, data, refundToken1, refundToken2) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            nullifier: data.inNullifier,
            pool: data.pool,
            amount: data.amount,
            amountBurn: data.amountBurn,
            stable: data.stable,
            assetsOut: [data.outAsset1, data.outAsset2],
            amountsOutMin: [data.outAmount1Min, data.outAmount2Min],
            deadline: data.deadline,
            noteFooters: [data.outNoteFooter1, data.outNoteFooter2],
            relayer: data.relayer,
            gasRefund: [refundToken1, refundToken2]
        }
        calldata = contract.methods.aerodromeRemoveLiquidity(data.proof, param)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.refundToken1, data.refundToken2)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolAerodromeRemoveLiquidityAbi.abi, pgDarkPoolAerodromeRemoveLiquidityAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const fees = await calculateFeeForTokens(gasFee, [data.outAsset1, data.outAsset2], [data.outAmount1, data.outAmount2])
        if (fees[0].gasFeeInToken + fees[0].serviceFeeInToken > BigInt(data.outAmount1)
            || fees[1].gasFeeInToken + fees[1].serviceFeeInToken > BigInt(data.outAmount2)) {
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
    AerodromRemoveLiquidityWorker
}