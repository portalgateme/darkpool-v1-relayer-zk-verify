const pgDarkPoolUniswapLiquidityABI = require('../../abis/pgDarkPoolUniswapLiquidityAssetManager.abi.json')

const {
    pgDarkPoolUniswapLiquidityAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')


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
            relayerGasFees: [data.refundToken1, data.refundToken2],
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

    async estimateGas(contract, data) {
        const contractCall = this.getContractCall(contract, data, data.refundToken1, data.refundToken2)
        try {
            const gasLimit = await contractCall.estimateGas()
            return gasLimit
        } catch (error) {
            console.error('Estimate gas failed: ', error)
            return gasLimits['DEFI_WITH_EXTRA']
        }
    }

    async getTxObj(web3, data, gasFee) {
        const contract = new web3.eth.Contract(pgDarkPoolUniswapLiquidityABI.abi, pgDarkPoolUniswapLiquidityAssetManager)
        const contractCall = this.getContractCall(contract, data, data.refundToken1, data.refundToken2)

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