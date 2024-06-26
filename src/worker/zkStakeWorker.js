const pgDarkPoolStakeABI = require('../../abis/pgDarkPoolStakingAssetManager.abi.json')
const {RelayerError } = require('../utils')


const {
    pgDarkPoolStakingAssetManager,
    gasLimits,
} = require('../config/config')
const { calculateFeesForOneToken } = require('../modules/fees')

const { BaseWorker } = require('./baseWorker')

class zkStakeWorker extends BaseWorker {

    getContractCall(contract, data, refund) {
        let calldata = contract.methods.lockNote({
            asset: data.inAsset,
            relayer: data.relayer,
            merkleRoot: data.merkleRoot,
            nullifier: data.inNullifier,
            amount: data.inAmount,
            relayerGasFee: refund,
            zkNoteFooter: data.outNoteFooter,
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
        const {gasFeeInToken} = await calculateFeesForOneToken(gasFee, data.inAsset, data.inAmount)
        if(gasFeeInToken > BigInt(data.inAmount)){
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
    zkStakeWorker
}