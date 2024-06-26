const pgDarkPoolCurveRemoveLiquidityABI = require('../../abis/pgDarkPoolCurveRemoveliquidityAssetManager.abi.json')
const pgDarkPoolCurveFSNRemoveLiquidityABI = require('../../abis/pgDarkPoolCurveFSNRemoveLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMPRemoveLiquidityABI = require('../../abis/pgDarkPoolCurveMPRemoveLiquidityAssetManager.abi.json')

const { POOL_TYPE, jobType } = require('../config/constants')
const {
    pgDarkPoolCurveRemoveLiquidityAssetManager,
    pgDarkPoolCurveFSNRemoveLiquidityAssetManager,
    pgDarkPoolCurveMPRemoveLiquidityAssetManager,
    gasLimits,
    gasUnitFallback
} = require('../config/config')

const { calculateFeeForTokens, calculateFeesForOneToken } = require('../modules/fees')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


const { BaseWorker } = require('./baseWorker')
const { RelayerError } = require('../utils')
const { estimateWithdrawOneCoinForMP, estimateWithdrawOneCoin, estimateWithdrawAllForMP, estimateWithdrawAll } = require('../defi/curveService')

class CurveRemoveLiquidityWorker extends BaseWorker {

    getContractCall(contract, data, gasRefunds) {
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
                minExpectedAmountsOut: data.minExpectedAmountsOut,
                noteFooters: data.noteFooters,
                relayer: data.relayer,
                gasRefund: gasRefunds,
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
                minExpectedAmountsOut: data.minExpectedAmountsOut,
                noteFooters: data.noteFooters,
                relayer: data.relayer,
                gasRefund: gasRefunds,
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
                poolFlag: data.poolFlag,
                booleanFlag: data.booleanFlag,
                minExpectedAmountsOut: data.minExpectedAmountsOut,
                noteFooters: data.noteFooters,
                relayer: data.relayer,
                gasRefund: gasRefunds,
            }
        }

        return contract.methods
            .curveRemoveLiquidity(data.proof, removeLpArgs)
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3, data)
        const contractCall = this.getContractCall(contract, data, data.gasRefund)
        return await contractCall.estimateGas()
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

    async getEstimatedOut(web3, data, gasFee) {
        const coins = data.assetsOut.filter(address => address !== ZERO_ADDRESS)
        let gasRefunds = [0n, 0n, 0n, 0n]
        if (coins.length == 1) {
            const index = data.assetsOut.findIndex(address => address !== ZERO_ADDRESS)
            const asset = data.assetsOut[index]
            let estimatedOut
            if (data.poolType == POOL_TYPE.META) {
                console.log("one coin, MP underlying")
                estimatedOut = await estimateWithdrawOneCoinForMP(web3, data.pool, data.basePoolType, data.amountBurn, index)
            } else {
                console.log("one coin, normal")
                estimatedOut = await estimateWithdrawOneCoin(web3, data.pool, parseInt(data.poolFlag,16), data.amountBurn, index)
            }

            const { gasFeeInToken, serviceFeeInToken } = await calculateFeesForOneToken(gasFee, asset, estimatedOut)
            if (gasFeeInToken + serviceFeeInToken > BigInt(estimatedOut)) {
                throw new RelayerError('Insufficient amount to pay fees')
            }
            gasRefunds[index] = gasFeeInToken
        } else if (coins.length >= 2) {
            let estimatedOuts
            if (data.poolType == POOL_TYPE.META) {
                estimatedOuts = await estimateWithdrawAllForMP(web3, data.pool,data.basePoolType, data.asset, data.amountBurn, coins.length)
            } else {
                estimatedOuts = await estimateWithdrawAll(web3, data.pool, data.asset, data.amountBurn, coins.length)
            }
            const fees = await calculateFeeForTokens(gasFee, coins, estimatedOuts)
            for (let i = 0; i < fees.length; i++) {
                const { gasFeeInToken, serviceFeeInToken } = fees[i]
                if (gasFeeInToken + serviceFeeInToken > BigInt(estimatedOuts[i])) {
                    throw new RelayerError('Insufficient amount to pay fees')
                }
                gasRefunds[i] = gasFeeInToken
            }
        } else {
            throw new RelayerError("Invalid coin number")
        }

        return gasRefunds
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3, data)
        const gasRefunds = await this.getEstimatedOut(web3, data, gasFee)

        const contractCall = this.getContractCall(contract, data, gasRefunds)

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