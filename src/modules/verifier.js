const pgVerifierHubABI = require('../../abis/pgIVerifierHub.abi')
const pgVerifierABI = require('../../abis/pgIVerifier.abi')
const {pgDarkPoolVerifierHub} = require('../config/config')
const {jobType} = require('../config/constants')
const {RelayerError } = require('../utils')


async function zkProofVerifier(web3, proof, input, job) {
   const hubContract = new web3.eth.Contract(pgVerifierHubABI, pgDarkPoolVerifierHub)
   let verifierContractAddress
   if (job === jobType.PG_DARKPOOL_WITHDRAW){
      verifierContractAddress = await hubContract.methods.getVerifier("withdraw").call()
   } else if (job === jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP){
      verifierContractAddress = await hubContract.methods.getVerifier("uniswapSwap").call()
   } else if (job === jobType.PG_DARKPOOL_UNISWAP_LP){
      verifierContractAddress = await hubContract.methods.getVerifier("uniswapLiquidityProvision").call()
   } else if (job === jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING){
      verifierContractAddress = await hubContract.methods.getVerifier("uniswapCollectFees").call()
   } else if (job === jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY){
      verifierContractAddress = await hubContract.methods.getVerifier("uniswapRemoveLiquidity").call()
   } else if (job === jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE){
      verifierContractAddress = await hubContract.methods.getVerifier("curveMultiExchange").call()
   } else if (job === jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY){
      verifierContractAddress = await hubContract.methods.getVerifier("curveAddLiquidity").call()
   } else if (job === jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY){
      verifierContractAddress = await hubContract.methods.getVerifier("curveRemoveLiquidity").call()
   } else{
      throw new RelayerError('Unknown job type.' , 0)
   }

   const verifierContract = new web3.eth.Contract(pgVerifierABI, verifierContractAddress)
   try {
      return await verifierContract.methods.verify(proof, input).call()
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