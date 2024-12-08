const pgVerifierHubABI = require('../../abis/pgIVerifierHub.abi')
const pgVerifierABI = require('../../abis/pgIVerifier.abi')
const { pgDarkPoolVerifierHub } = require('../config/config')
const { jobType } = require('../config/constants')
const { RelayerError } = require('../utils')
const { submitProof } = require('../worker/zkVerifyWorker')
const ethers = require('ethers')


const VKHashMap = {
   [jobType.PG_DARKPOOL_WITHDRAW]: '0xe7f8b00b8828bd428c74c74a2e7068f6b77ace08f9c3d35c3569c25a25c4b034',
}

async function zkProofVerifier(web3, proof, input, job) {
   let vkHash = VKHashMap[job]
   if (!vkHash) {
      throw new RelayerError('Unknown job type.', 0)
   }
   const result = await submitProof(proof, input, vkHash)
   return {
      attestationId: ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(result.attestationId)), 32),
      merklePath: result.merklePath,
      leafCount: ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(result.leafCount)), 32),
      index: ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(result.index)), 32)
   }
}

module.exports = {
   zkProofVerifier,
}