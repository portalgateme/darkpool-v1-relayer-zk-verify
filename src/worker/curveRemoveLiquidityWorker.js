const pgDarkPoolCurveRemoveLiquidityABI = require('../../abis/pgDarkPoolCurveRemoveliquidityAssetManager.abi.json')
const pgDarkPoolCurveFSNRemoveLiquidityABI = require('../../abis/pgDarkPoolCurveFSNRemoveLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMPRemoveLiquidityABI = require('../../abis/pgDarkPoolCurveMPRemoveLiquidityAssetManager.abi.json')

const { POOL_TYPE } = require('../config/constants')
const {
    pgDarkPoolCurveRemoveLiquidityAssetManager,
    pgDarkPoolCurveFSNRemoveLiquidityAssetManager,
    pgDarkPoolCurveMPRemoveLiquidityAssetManager,
    gasLimits
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')

class CurveRemoveLiquidityWorker extends BaseWorker {

    getContractCall(contract, data) {
        let removeLpArgs

        if (data.poolType == POOL_TYPE.META) {
            removeLpArgs = {
                merkleRoot: data.merkleRoot,
                nullifier: data.nullifier,
                asset: data.asset,
                amount: data.amount,
                amountBurn: data.amountBurn,
                pool: data.pool,
                assetsOut: data.assetsOut,
                basePoolType: data.basePoolType,
                noteFooters: data.noteFooters,
                relayer: data.relayer,
                gasRefund: data.gasRefund,
            }
        } else if (data.poolType == POOL_TYPE.FSN) {
            removeLpArgs = {
                merkleRoot: data.merkleRoot,
                nullifier: data.nullifier,
                asset: data.asset,
                amount: data.amount,
                amountBurn: data.amountBurn,
                pool: data.pool,
                assetsOut: data.assetsOut,
                noteFooters: data.noteFooters,
                relayer: data.relayer,
                gasRefund: data.gasRefund,
            }
        } else {
            removeLpArgs = {
                merkleRoot: data.merkleRoot,
                nullifier: data.nullifier,
                asset: data.asset,
                amount: data.amount,
                amountBurn: data.amountBurn,
                pool: data.pool,
                assetsOut: data.assetsOut,
                isPlain: data.isPlain,
                isLegacy: data.isLegacy,
                booleanFlag: data.booleanFlag,
                noteFooters: data.noteFooters,
                relayer: data.relayer,
                gasRefund: data.gasRefund,
            }
        }

        return contract.methods
            .curveRemoveLiquidity(data.proof, removeLpArgs)
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
        let contract
        if (data.poolType == POOL_TYPE.META) {
            contract = new web3.eth.Contract(pgDarkPoolCurveMPRemoveLiquidityABI.abi, pgDarkPoolCurveMPRemoveLiquidityAssetManager)
        } else if (data.poolType == POOL_TYPE.FSN) {
            contract = new web3.eth.Contract(pgDarkPoolCurveFSNRemoveLiquidityABI.abi, pgDarkPoolCurveFSNRemoveLiquidityAssetManager)
        } else {
            contract = new web3.eth.Contract(pgDarkPoolCurveRemoveLiquidityABI.abi, pgDarkPoolCurveRemoveLiquidityAssetManager)
        }
        return contract
    }

    async getTxObj(web3, data) {
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
    CurveRemoveLiquidityWorker
}