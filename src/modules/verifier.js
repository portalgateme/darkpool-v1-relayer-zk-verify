const pgVerifierHubABI = require('../../abis/pgIVerifierHub.abi')
const pgVerifierABI = require('../../abis/pgIVerifier.abi')
const {
   pgDarkPoolVerifierHub
} = require('../config')

async function withdrawalProof(web3, proof, input) {
   const hubContract = new web3.eth.Contract(pgVerifierHubABI, pgDarkPoolVerifierHub)
   const withdrawContractAddress = await hubContract.methods.getVerifier("withdraw").call()
   const withdrawContract = new web3.eth.Contract(pgVerifierABI, withdrawContractAddress)
   try {
      return await withdrawContract.methods.verify(proof, input).call()
   } catch (e) {
      if (e.message.indexOf('0x0711fcec') !== -1) {
         return false
      }
      throw e
   }
}

module.exports = {
   withdrawalProof,
}