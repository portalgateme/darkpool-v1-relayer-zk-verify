const { toBN } = require('web3-utils')
const pgDarkPoolUniswapLiquidityABI = require('../../abis/pgDarkPoolUniswapLiquidityAssetManager.abi.json')

const {
    pgDarkPoolUniswapLiquidityAssetManager,
    gasLimits,
    gasUnitFallback,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { calculateFeeForTokens } = require('../modules/fees')
const { jobType } = require('../config/constants')


class UniswapAddLiquidityWorker extends BaseWorker {

    getContractCall(contract, data, refundToken1, refundToken2) {
        let calldata

        const param = {
            noteData1: {
                assetAddress: data.asset1,
                amount: data.amount1,
                nullifier: data.nullifier1,
            },
            noteData2: {
                assetAddress: data.asset2,
                amount: data.amount2,
                nullifier: data.nullifier2,
            },
            relayer: data.relayer,
            relayerGasFees: [refundToken1, refundToken2],
            merkleRoot: data.merkleRoot,
            changeNoteFooters: [data.changeNoteFooter1, data.changeNoteFooter2],
            tickMin: data.tickMin,
            tickMax: data.tickMax,
            deadline: data.deadline,
            positionNoteFooter: data.outNoteFooter,
            poolFee: data.feeTier,
            amountsMin: [data.amountMin1, data.amountMin2],
        }
        calldata = contract.methods.uniswapLiquidityProvision(param, data.proof)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.refundToken1, data.refundToken2)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolUniswapLiquidityABI.abi, pgDarkPoolUniswapLiquidityAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const fees = await calculateFeeForTokens(gasFee, [data.asset1, data.asset2], [data.amount1, data.amount2])
        if (fees[0].gasFeeInToken + fees[0].serviceFeeInToken > BigInt(data.amount1)
            || fees[1].gasFeeInToken + fees[1].serviceFeeInToken > BigInt(data.amount2)) {
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
    UniswapAddLiquidityWorker
}