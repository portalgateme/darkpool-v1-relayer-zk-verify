//const { verifyWithdrawProof,WithdrawVerifyParam } = require('@portalgateme/darkpool-v1-proof')
import { verifyWithdrawProof,WithdrawVerifyParam }  from ('@portalgateme/darkpool-v1-proof')

async function withdrawalProof(root, asset, amount, nullifier, proof) {
   const param = new WithdrawVerifyParam(root, asset, amount, nullifier, proof)
   const result =  await verifyWithdrawProof(param)
   return result
}

module.exports = {
   withdrawalProof,
}