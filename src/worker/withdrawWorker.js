const pgDarkPoolABI = require('../../abis/pgDarkPool.abi.json')

const { isETH } = require('../utils')
const {
  pgDarkPoolAssetManager,
  gasLimits,
} = require('../config/config')

const { BaseWorker } = require('./baseWorker')


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
    const contractCall = this.getContractCall(contract, data, gasLimits['WITHDRAW_WITH_EXTRA'])
    try {
      return await contractCall.estimateGas()
    } catch (error) {
      console.error('Estimate gas failed: ', error)
      return gasLimits['WITHDRAW_WITH_EXTRA']
    }
  }

  getContract(web3, data) {
    return new web3.eth.Contract(pgDarkPoolABI, pgDarkPoolAssetManager)
  }

  async getTxObj(web3, data, gasFee) {
    const contract = this.getContract(web3, data)
    const contractCall = this.getContractCall(contract, data, data.refund)

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