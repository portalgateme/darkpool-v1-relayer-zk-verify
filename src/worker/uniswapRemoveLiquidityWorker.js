const pgDarkPoolUniswapLiquidityABI = require('../../abis/pgDarkPoolUniswapLiquidityAssetManager.abi.json')

const {
    pgDarkPoolUniswapLiquidityAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')


class UniswapRemoveLiquidityWorker extends BaseWorker {

    getContractCall(contract, data) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            positionNote: {
              assetAddress: data.nftAddress,
              amount: data.tokenId,
              nullifier: data.nullifier,
            },
            outNoteFooters: [data.outNoteFooter1, data.outNoteFooter2],
            relayerGasFees: [data.relayerGasFeeFromToken1, data.relayerGasFeeFromToken2],
            deadline: data.deadline,
            relayer: data.relayer,
            amountsMin: [data.amount1Min, data.amount2Min],
          }
          calldata = contract.methods.uniswapRemoveLiquidity(param, data.proof)


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
    UniswapRemoveLiquidityWorker
}