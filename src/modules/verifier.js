const pgVerifierHubABI = require('../../abis/pgIVerifierHub.abi')
const pgVerifierABI = require('../../abis/pgIVerifier.abi')
const pgDarkPoolVerifierHub = require('../config/config')
const jobType = require('../config/constants')

async function zkProofVerifier(web3, proof, input, job) {
   const hubContract = new web3.eth.Contract(pgVerifierHubABI, pgDarkPoolVerifierHub)
   let withdrawContractAddress
   if (job === jobType.PG_DARKPOOL_WITHDRAW){
      withdrawContractAddress = await hubContract.methods.getVerifier("withdraw").call()
   } else if (job === jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP){
      withdrawContractAddress = await hubContract.methods.getVerifier("uniswapSwap").call()
   } else if (job === jobType.PG_DARKPOOL_UNISWAP_LP){
      withdrawContractAddress = await hubContract.methods.getVerifier("uniswapLP").call()
   } else if (job === jobType.PG_DARKPOOL_CURVE_STABLESWAP){
      withdrawContractAddress = await hubContract.methods.getVerifier("curveSwap").call()
   } else if (job === jobType.PG_DARKPOOL_CURVE_LP){
      withdrawContractAddress = await hubContract.methods.getVerifier("curveLP").call()
   } else if (job === jobType.PG_DARKPOOL_1INCH_SWAP){
      withdrawContractAddress = await hubContract.methods.getVerifier("1incnSwap").call()
   } else{
      throw new RelayerError('Unknown job type.' , 0)
   }

   const withdrawContract = new web3.eth.Contract(pgVerifierABI, withdrawContractAddress)
   try {
      return await withdrawContract.methods.verify(proof, input).call()
   } catch (e) {
      if (e.message.indexOf('0x0711fcec') !== -1) {
         return false
      }
      throw new RelayerError('Proof fail, Please try again later' , 0)
   }

}

module.exports = {
   zkProofVerifier,
}