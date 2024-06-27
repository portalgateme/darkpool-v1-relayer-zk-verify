const pgDarkPoolUniswapSwapABI = require('../../abis/pgDarkPoolUniswapSwapAssetManager.abi.json')

const {
    pgDarkPoolUniswapSwapAssetManager,
    gasLimits,
    gasUnitFallback,
} = require('../config/config')
const { jobType } = require('../config/constants')
const { calculateFeesForOneToken } = require('../modules/fees')
const { toBN } = require('../utils')

const { BaseWorker } = require('./baseWorker')

class UniswapSingleSwapWorker extends BaseWorker {

    getContractCall(contract, data, refund) {
        let calldata = contract.methods.uniswapSimpleSwap({
            inNoteData: {
                assetAddress: data.asset,
                amount: data.amount,
                nullifier: data.nullifier,
            },
            merkleRoot: data.merkleRoot,
            assetOut: data.assetOut,
            relayer: data.relayer,
            amountOutMin: data.amountOutMin,
            noteFooter: data.noteFooterOut,
            relayerGasFee: refund,
            poolFee: data.poolFee,
        }, data.proof)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.refund)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolUniswapSwapABI.abi, pgDarkPoolUniswapSwapAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const {gasFeeInToken, serviceFeeInToken} = await calculateFeesForOneToken(gasFee, data.asset, data.amount)
        if(gasFeeInToken+ serviceFeeInToken > BigInt(data.amount)){
            throw new Error('Insufficient amount to pay fees')
        }

        console.log(gasFee, gasFeeInToken, serviceFeeInToken, BigInt(data.amount))

        const contractCall = this.getContractCall(contract, data, gasFeeInToken)

        return {
            to: contract._address,
            data: contractCall.encodeABI(),
            gasLimit: gasLimits['DEFI_WITH_EXTRA'],
        }
    }
}

module.exports = {
    UniswapSingleSwapWorker
}