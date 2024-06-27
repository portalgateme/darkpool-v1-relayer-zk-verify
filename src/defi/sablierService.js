const ISablierV2LockupDynamicAbi = require('../../abis/sablier/ISablierV2LockupDynamic.json')
const ISablierV2LockupLinearAbi = require('../../abis/sablier/ISablierV2LockupLinear.json')

const { sablierV2LockupDynamic, sablierV2LockupLinear } = require('../config/config')

async function getWithdrawableAmount(web3, streamId, isLinear) {
    if (isLinear) {
        const contract = new web3.eth.Contract(ISablierV2LockupLinearAbi.abi, sablierV2LockupLinear)
        return contract.methods.withdrawableAmountOf(streamId).call()
    } else {
        const contract = new web3.eth.Contract(ISablierV2LockupDynamicAbi.abi, sablierV2LockupDynamic)
        return contract.methods.withdrawableAmountOf(streamId).call()
    }
}

async function getAsset(web3, streamId, isLinear) {
    if (isLinear) {
        const contract = new web3.eth.Contract(ISablierV2LockupLinearAbi.abi, sablierV2LockupLinear)
        return contract.methods.getAsset(streamId).call()
    } else {
        const contract = new web3.eth.Contract(ISablierV2LockupDynamicAbi.abi, sablierV2LockupDynamic)
        return contract.methods.getAsset(streamId).call()
    }
}



module.exports = {
    getWithdrawableAmount,
    getAsset
}