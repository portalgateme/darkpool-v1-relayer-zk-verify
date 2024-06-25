const pgDarkPoolABI = require('../../abis/pgDarkPool.abi.json')

const { isETH, toBN, RelayerError } = require('../utils')
const { calculateFeesForOneToken } = require('../modules/fees')

const {
  pgDarkPoolAssetManager,
  gasLimits,
  gasUnitFallback,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')
const { jobType } = require('../config/constants')

class WithdrawWorker extends BaseWorker {

  getContractCall(contract, data, refund) {
    let calldata
    if (isETH(data.asset)) {
      calldata = contract.methods.withdrawETH(data.proof, data.merkleRoot, data.nullifier, data.recipient, data.relayer, refund, data.amount)
    } else {
      calldata = contract.methods.withdrawERC20(data.asset, data.proof, data.merkleRoot, data.nullifier, data.recipient, data.relayer, data.amount, refund)
    }

    return calldata
  }

  async estimateGas(web3, data) {
    const contract = this.getContract(web3, data)
    const contractCall = this.getContractCall(contract, data, 0)
    return await contractCall.estimateGas()
  }

  getContract(web3) {
    return new web3.eth.Contract(pgDarkPoolABI.abi, pgDarkPoolAssetManager)
  }

  async getTxObj(web3, data, gasFee) {
    const contract = this.getContract(web3)
    const { gasFeeInToken, serviceFeeInToken } = await calculateFeesForOneToken(gasFee, data.asset, data.amount)
    console.log(gasFee,gasFeeInToken,serviceFeeInToken, BigInt(data.amount))
    if (gasFeeInToken + serviceFeeInToken > BigInt(data.amount)) {
      throw new RelayerError('Insufficient funds to pay fees')
    }

    const contractCall = this.getContractCall(contract, data, gasFeeInToken)

    return {
      to: contract._address,
      data: contractCall.encodeABI(),
      gasLimit: gasLimits['WITHDRAW_WITH_EXTRA'],
    }
  }
}

module.exports = {
  WithdrawWorker
}