const pgDarkPoolUniswapLiquidityABI = require('../../abis/pgDarkPoolUniswapLiquidityAssetManager.abi.json')

const {
    pgDarkPoolUniswapLiquidityAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')

class UniswapCollectFeesWorker extends BaseWorker {

    getContractCall(contract, data) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            tokenId: data.tokenId,
            feeNoteFooters: [data.feeNoteFooter1, data.feeNoteFooter2],
            relayerGasFees: [data.relayerGasFeeFromToken1, data.relayerGasFeeFromToken2],
            relayer: data.relayer,
        }
        calldata = contract.methods.uniswapCollectFees(param, data.proof)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3, data)
        const contractCall = this.getContractCall(contract, data)
        try {
            const gasLimit = await contractCall.estimateGas()
            return gasLimit
        } catch (error) {
            console.error('Estimate gas failed: ', error)
            return gasLimits['DEFI_WITH_EXTRA']
        }
    }

    getContract(web3, data) {
        return new web3.eth.Contract(pgDarkPoolUniswapLiquidityABI.abi, pgDarkPoolUniswapLiquidityAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3, data)
        const contractCall = this.getContractCall(contract, data)

        return {
            to: contract._address,
            data: contractCall.encodeABI(),
            gasLimit: gasLimits['DEFI_WITH_EXTRA'],
        }
    }
}

module.exports = {
    UniswapCollectFeesWorker
}