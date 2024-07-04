const pgDarkPoolSablierDynamicAssetManagerABI = require('../../abis/pgDarkPoolSablierDynamicAssetManager.json')
const pgDarkPoolSablierLinearAssetManagerABI = require('../../abis/pgDarkPoolSablierLinearAssetManager.json')

const { RelayerError, isAddressEquals } = require('../utils')
const { calculateFeesForOneToken } = require('../modules/fees')

const {
  pgDarkPoolSablierDynamicAssetManager,
  pgDarkPoolSablierLinearAssetManager,
  gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { getAsset, getWithdrawableAmount } = require('../defi/sablierService')
const config = require('../config/config')

class SablierClaimWorker extends BaseWorker {

  getContractCall(contract, data, refund) {
    let calldata
    calldata = contract.methods.claimStream(
      data.proof,
      {
        merkleRoot: data.merkleRoot,
        nullifierIn: data.nullifier,
        stream: data.stream,
        streamId: data.streamId,
        assetOut: data.assetOut,
        amountOut: data.amountOut,
        noteFooter: data.noteFooterOut,
        relayer: data.relayer,
        gasRefund: refund,
      })

    return calldata
  }

  async estimateGas(web3, data) {
    const contract = this.getContract(web3, data)
    const contractCall = this.getContractCall(contract, data, gasLimits.DEFI_WITH_EXTRA)
    return await contractCall.estimateGas()
  }

  getContract(web3, data) {
    if (this.isLinear(data)) {
      return new web3.eth.Contract(pgDarkPoolSablierLinearAssetManagerABI.abi, pgDarkPoolSablierLinearAssetManager)
    } else {
      return new web3.eth.Contract(pgDarkPoolSablierDynamicAssetManagerABI.abi, pgDarkPoolSablierDynamicAssetManager)
    }
  }

  isLinear(data) {
    if (isAddressEquals(data.stream, config.sablierV2LockupLinear)) {
      return true
    } else if (isAddressEquals(data.stream, config.sablierV2LockupDynamic)) {
      return false
    } else {
      throw new RelayerError('Unknown stream address')
    }
  }

  async check(web3, data) {
    const asset = await getAsset(web3, data.streamId, this.isLinear(data))
    if (!isAddressEquals(asset, data.assetOut)) {
      throw new RelayerError('Claim asset mismatch')
    }

    const withdrawableAmount = await getWithdrawableAmount(web3, data.streamId, this.isLinear(data))
    if (BigInt(withdrawableAmount) < BigInt(data.amountOut)) {
      throw new RelayerError('Insufficient funds to claim')
    }
  }

  async getTxObj(web3, data, gasFee) {
    const contract = this.getContract(web3, data)
    await this.check(web3, data)
    const { gasFeeInToken, serviceFeeInToken } = await calculateFeesForOneToken(gasFee, data.assetOut, data.amountOut)
    console.log(gasFee, gasFeeInToken, serviceFeeInToken, BigInt(data.amountOut))
    if (gasFeeInToken + serviceFeeInToken > BigInt(data.amountOut)) {
      throw new RelayerError('Insufficient funds to pay fees')
    }

    const contractCall = this.getContractCall(contract, data, gasFeeInToken)

    return {
      to: contract._address,
      data: contractCall.encodeABI(),
      gasLimit: gasLimits.DEFI_WITH_EXTRA,
    }
  }
}

module.exports = {
  SablierClaimWorker
}