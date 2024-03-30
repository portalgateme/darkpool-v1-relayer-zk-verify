const pgDarkPoolCurveAddLiquidityABI = require('../../abis/pgDarkPoolCurveAddliquidityAssetManager.abi.json')
const pgDarkPoolCurveFSNAddLiquidityABI = require('../../abis/pgDarkPoolCurveFSNAddLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMPAddLiquidityABI = require('../../abis/pgDarkPoolCurveMPAddLiquidityAssetManager.abi.json')

const { POOL_TYPE } = require('../config/constants')
const {
    pgDarkPoolCurveAddLiquidityAssetManager,
    pgDarkPoolCurveFSNAddLiquidityAssetManager,
    pgDarkPoolCurveMPAddLiquidityAssetManager,
    gasLimits
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')

class CurveAddLiquidityWorker extends BaseWorker {

    getContractCall(contract, data) {
        let calldata
        let lpArgs

        if (data.poolType == POOL_TYPE.META) {
            lpArgs = {
                merkleRoot: data.merkleRoot,
                nullifiers: data.nullifiers,
                assets: data.assets,
                amounts: data.amounts,
                pool: data.pool,
                basePoolType: data.basePoolType,
                lpToken: data.lpToken,
                noteFooter: data.noteFooter,
                relayer: data.relayer,
                gasRefund: data.gasRefund,
            }
        } else if (data.poolType == POOL_TYPE.FSN) {
            lpArgs = {
                merkleRoot: data.merkleRoot,
                nullifiers: data.nullifiers,
                assets: data.assets,
                amounts: data.amounts,
                pool: data.pool,
                lpToken: data.lpToken,
                noteFooter: data.noteFooter,
                relayer: data.relayer,
                gasRefund: data.gasRefund,
            }
        } else {
            lpArgs = {
                merkleRoot: data.merkleRoot,
                nullifiers: data.nullifiers,
                assets: data.assets,
                amounts: data.amounts,
                pool: data.pool,
                lpToken: data.lpToken,
                isPlain: data.isPlain,
                isLegacy: data.isLegacy,
                booleanFlag: data.booleanFlag,
                noteFooter: data.noteFooter,
                relayer: data.relayer,
                gasRefund: data.gasRefund,
            }
        }

        calldata = contract.methods
            .curveAddLiquidity(data.proof, lpArgs)

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
        let contract
        if (data.poolType == POOL_TYPE.META) {
            contract = new web3.eth.Contract(pgDarkPoolCurveMPAddLiquidityABI.abi, pgDarkPoolCurveMPAddLiquidityAssetManager)
        } else if (data.poolType == POOL_TYPE.FSN) {
            contract = new web3.eth.Contract(pgDarkPoolCurveFSNAddLiquidityABI.abi, pgDarkPoolCurveFSNAddLiquidityAssetManager)
        } else {
            contract = new web3.eth.Contract(pgDarkPoolCurveAddLiquidityABI.abi, pgDarkPoolCurveAddLiquidityAssetManager)
        }
        return contract
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
    CurveAddLiquidityWorker
}