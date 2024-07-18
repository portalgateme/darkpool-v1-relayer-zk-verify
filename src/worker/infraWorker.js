const pgDarkPoolInfraABI = require('../../abis/pgDarkPoolGeneralDefiIntegrationAssetManager.abi.json')

const {
    pgDarkPoolGeneralDefiIntegrationAssetManager,
    gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { calculateFeeForTokens } = require('../modules/fees')


class InfraWorker extends BaseWorker {

    getContractCall(contract, data, gasRefund) {
        let calldata

        const param = {
            merkleRoot: data.merkleRoot,
            nullifiers: data.inNullifiers,
            inNoteType: data.inNoteType,
            assets: data.inAssets,
            amountsOrNftIds: data.inAmountsOrNftIds,
            contractAddress: data.contractAddress,
            defiParameters: data.defiParameters,
            defiParametersHash: data.defiParameterHash,
            noteFooters: data.outNoteFooters,
            outNoteType: data.outNoteType,
            relayer: data.relayer,
            gasRefund,
        }
        calldata = contract.methods.deFiIntegrate(data.proof, param)

        return calldata
    }

    async estimateGas(web3, data) {
        const contract = this.getContract(web3)
        const contractCall = this.getContractCall(contract, data, data.gasRefund)
        return await contractCall.estimateGas()
    }

    getContract(web3) {
        return new web3.eth.Contract(pgDarkPoolInfraABI.abi, pgDarkPoolGeneralDefiIntegrationAssetManager)
    }

    async getTxObj(web3, data, gasFee) {
        const contract = this.getContract(web3, data)
        let gasRefunds = []
        if (data.inNoteType == 0) {
            const fees = await calculateFeeForTokens(gasFee, data.inAssets, data.inAmountsOrNftIds)
            for (let i = 0; i < fees.length; i++) {
                if (BigInt(data.inAmountsOrNftIds[i]) > 0n && fees[i].gasFeeInToken + fees[i].serviceFeeInToken > BigInt(data.inAmountsOrNftIds[i])) {
                    throw new Error('Insufficient amount to pay fees')
                }
            }
            gasRefunds = fees.map(fee => fee.gasFeeInToken)
            
        } else {
            //in note NFT
            throw new Error('NFT not supported yet')
        }

        const contractCall = this.getContractCall(contract, data, gasRefunds)

        return {
            to: contract._address,
            data: contractCall.encodeABI(),
            gasLimit: gasLimits['DEFI_WITH_EXTRA'],
        }
    }
}

module.exports = {
    InfraWorker
}