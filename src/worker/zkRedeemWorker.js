const pgDarkPoolStakeABI = require('../../abis/pgDarkPoolStakingAssetManager.abi.json')
const StakingOperatorABI = require('../../abis/pgDarkPoolStakingOperator.abi.json')
const {RelayerError } = require('../utils')


const {
    pgDarkPoolStakingAssetManager,
    pgDarkPoolStakingOperator,
    gasLimits,
} = require('../config/config')
const { calculateFeesForOneToken } = require('../modules/fees')

const { BaseWorker } = require('./baseWorker')

class zkRedeemWorker extends BaseWorker {

    async getOriginalToken(web3, zkAsset) {
        const contract = new web3.eth.Contract(StakingOperatorABI.abi, pgDarkPoolStakingOperator)
        const originalToken = await contract.methods.getOriginalToken(zkAsset).call()

        return originalToken
    }

    getContractCall(contract, data, refund) {
        let calldata = contract.methods.unlock({
            relayer: data.relayer,
            relayerGasFee: refund,
            merkleRoot: data.merkleRoot,
            zkNoteNullifier: data.inNullifier,
            zkNoteAsset: data.inAsset,
            zkNoteAmount: data.inAmount,
            outNoteFooter: data.outNoteFooter,
        }, data.proof)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.refund)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolStakeABI.abi, pgDarkPoolStakingAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3)
        const originalAsset = await this.getOriginalToken(web3, data.inAsset)
        const { gasFeeInToken } = await calculateFeesForOneToken(gasFee, originalAsset, data.inAmount)
        if (gasFeeInToken > BigInt(data.inAmount)) {
            throw new Error('Insufficient amount to pay fees')
        }

        console.log(gasFee, gasFeeInToken, BigInt(data.inAmount))

        const contractCall = this.getContractCall(contract, data, gasFeeInToken)

        return {
            to: contract._address,
            data: contractCall.encodeABI(),
            gasLimit: gasLimits['DEFI_WITH_EXTRA'],
        }
    }
}

module.exports = {
    zkRedeemWorker
}