const pgDarkPoolUniswapLiquidityABI = require('../../abis/pgDarkPoolUniswapLiquidityAssetManager.abi.json')

const {
    pgDarkPoolUniswapLiquidityAssetManager,
    gasLimits,
    gasUnitFallback,
} = require('../config/config')
const { jobType } = require('../config/constants')

const { getLiquidity } = require('../defi/uniswap')
const { calculateFeeForTokens } = require('../modules/fees')

const { BaseWorker } = require('./baseWorker')

class UniswapCollectFeesWorker extends BaseWorker {

    getContractCall(contract, data, refund) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            tokenId: data.tokenId,
            feeNoteFooters: [data.feeNoteFooter1, data.feeNoteFooter2],
            relayerGasFees: refund,
            relayer: data.relayer,
        }
        calldata = contract.methods.uniswapCollectFees(param, data.proof)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3, data)
        const contractCall = this.getContractCall(contract, data, [0x0, 0x0])
        return await contractCall.estimateGas()
    }

    getContract(web3, data) {
        return new web3.eth.Contract(pgDarkPoolUniswapLiquidityABI.abi, pgDarkPoolUniswapLiquidityAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3, data)

        const { token0Address, token1Address, fee0, fee1 } = await getLiquidity(web3, data.tokenId)
        const fees = await calculateFeeForTokens(gasFee, [token0Address, token1Address], [fee0, fee1])
        if (fees[0].gasFeeInToken + fees[0].serviceFeeInToken > fee0
            || fees[1].gasFeeInToken + fees[1].serviceFeeInToken > fee1) {
            throw new Error('Insufficient amount to pay fees')
        }

        const contractCall = this.getContractCall(contract, data, [fees[0].gasFeeInToken, fees[1].gasFeeInToken])

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