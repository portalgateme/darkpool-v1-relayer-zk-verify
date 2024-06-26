const pgDarkPoolCurveAddLiquidityABI = require('../../abis/pgDarkPoolCurveAddliquidityAssetManager.abi.json')
const pgDarkPoolCurveFSNAddLiquidityABI = require('../../abis/pgDarkPoolCurveFSNAddLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMPAddLiquidityABI = require('../../abis/pgDarkPoolCurveMPAddLiquidityAssetManager.abi.json')

const { POOL_TYPE } = require('../config/constants')
const {
    pgDarkPoolCurveAddLiquidityAssetManager,
    pgDarkPoolCurveFSNAddLiquidityAssetManager,
    pgDarkPoolCurveMPAddLiquidityAssetManager,
    gasLimits,
} = require('../config/config')
const { calculateFeeForTokens } = require('../modules/fees')

const { BaseWorker } = require('./baseWorker')

class CurveAddLiquidityWorker extends BaseWorker {

    getContractCall(contract, data, gasRefunds) {
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
                minMintAmount: data.minMintAmount,
                noteFooter: data.noteFooter,
                relayer: data.relayer,
                gasRefund: gasRefunds,
            }
        } else if (data.poolType == POOL_TYPE.FSN) {
            lpArgs = {
                merkleRoot: data.merkleRoot,
                nullifiers: data.nullifiers,
                assets: data.assets,
                amounts: data.amounts,
                pool: data.pool,
                lpToken: data.lpToken,
                minMintAmount: data.minMintAmount,
                noteFooter: data.noteFooter,
                relayer: data.relayer,
                gasRefund: gasRefunds,
            }
        } else {
            lpArgs = {
                merkleRoot: data.merkleRoot,
                nullifiers: data.nullifiers,
                assets: data.assets,
                amounts: data.amounts,
                pool: data.pool,
                lpToken: data.lpToken,
                poolFlag: data.poolFlag,
                booleanFlag: data.booleanFlag,
                minMintAmount: data.minMintAmount,
                noteFooter: data.noteFooter,
                relayer: data.relayer,
                gasRefund: gasRefunds,
            }
        }

        calldata = contract.methods
            .curveAddLiquidity(data.proof, lpArgs)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3, data)
        const contractCall = this.getContractCall(contract, data, data.gasRefund)
        return await contractCall.estimateGas()
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
        const fees = await calculateFeeForTokens(gasFee, data.assets, data.amounts)
        for (let i = 0; i < fees.length; i++) {
            if (BigInt(data.amounts[i]) > 0n && fees[i].gasFeeInToken + fees[i].serviceFeeInToken > BigInt(data.amounts[i])) {
                throw new Error('Insufficient amount to pay fees')
            }
        }

        const gasRefunds = fees.map(fee => fee.gasFeeInToken)
        const contractCall = this.getContractCall(contract, data, gasRefunds)

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