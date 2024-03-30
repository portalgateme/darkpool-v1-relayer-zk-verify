const pgDarkPoolUniswapSwapABI = require('../../abis/pgDarkPoolUniswapSwapAssetManager.abi.json')

const {
    pgDarkPoolUniswapSwapAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')

class UniswapSingleSwapWorker extends BaseWorker {

    getContractCall(contract, data) {
        let calldata

        calldata = contract.methods.uniswapSimpleSwap({
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
            relayerGasFee: data.refund,
            poolFee: data.poolFee,
        }, data.proof)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data)
        try {
            const gasLimit = await contractCall.estimateGas()
            return gasLimit
        } catch (error) {
            console.error('Estimate gas failed: ', error)
            return gasLimits['DEFI_WITH_EXTRA']
        }
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolUniswapSwapABI.abi, pgDarkPoolUniswapSwapAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data)

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