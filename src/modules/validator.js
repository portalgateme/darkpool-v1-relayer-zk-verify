const { isAddress, toChecksumAddress } = require('web3-utils')
//const { getInstance } = require('../utils')
const { isETH } = require('../utils')
const { rewardAccount } = require('../config')

const Ajv = require('ajv')
const ajv = new Ajv({ format: 'fast' })

ajv.addKeyword('isAddress', {
  validate: (schema, data) => {
    try {
      return isAddress(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})

/*ajv.addKeyword('isKnownContract', {
  validate: (schema, data) => {
    try {
      return !!getInstance(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})*/

ajv.addKeyword('isETH', {
  validate: (schema, data) =>{
    try{
      return isETH(data)
    }catch (e){
      return false
    }
  },
  errors: true,
})

ajv.addKeyword('isFeeRecipient', {
  validate: (schema, data) => {
    try {
      return toChecksumAddress(rewardAccount) === toChecksumAddress(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})

const addressType = { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$', isAddress: true }
const proofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{4288}$' }
//const encryptedAccountType = { type: 'string', pattern: '^0x[a-fA-F0-9]{392}$' }
const bytes32Type = { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' }
//const instanceType = { ...addressType, isKnownContract: true }
const assetType = { ...addressType, isETH: true}
const relayerType = { ...addressType, isFeeRecipient: true }

const pgDarkPoolWithdrawSchema = {
  type: 'object',
  properties: {
    asset: assetType,
    proof: proofType,
    //contract: instanceType,
    args: {
      type: 'array',
      maxItems: 7,
      minItems: 7,
      items: [bytes32Type, bytes32Type, addressType, relayerType, bytes32Type ,bytes32Type, bytes32Type],
    },
  },
  additionalProperties: false,
  required: ['asset', 'proof', 'args'],
}

const pgDarkPoolUniswapSSSchema = {
  type: 'object',
  properties: {
    asset: assetType,
    proof: proofType,
    //contract: instanceType,
    args: {
      type: 'array',
      maxItems: 8,
      minItems: 8,
      items: [bytes32Type, bytes32Type, assetType, relayerType, 
              bytes32Type, bytes32Type, bytes32Type, bytes32Type],
    },
  },
  additionalProperties: false,
  required: ['asset', 'proof', 'args'],
}

const pgDarkPoolUniswapLPSchema = {
  type: 'object',
  properties: {
    asset1: assetType,
    proof1: proofType,
    asset2: assetType,
    proof2: proofType,
    //contract: instanceType,
    args: {
      type: 'array',
      maxItems: 12,
      minItems: 12,
      items: [bytes32Type, bytes32Type, bytes32Type, bytes32Type, relayerType, 
              bytes32Type, bytes32Type, bytes32Type, bytes32Type, bytes32Type, bytes32Type, bytes32Type],
    },
  },
  additionalProperties: false,
  required: ['asset', 'proof', 'args'],
}


/*const miningRewardSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    args: {
      type: 'object',
      properties: {
        rate: bytes32Type,
        fee: bytes32Type,
        instance: instanceType,
        rewardNullifier: bytes32Type,
        extDataHash: bytes32Type,
        depositRoot: bytes32Type,
        withdrawalRoot: bytes32Type,
        extData: {
          type: 'object',
          properties: {
            relayer: relayerType,
            encryptedAccount: encryptedAccountType,
          },
          additionalProperties: false,
          required: ['relayer', 'encryptedAccount'],
        },
        account: {
          type: 'object',
          properties: {
            inputRoot: bytes32Type,
            inputNullifierHash: bytes32Type,
            outputRoot: bytes32Type,
            outputPathIndices: bytes32Type,
            outputCommitment: bytes32Type,
          },
          additionalProperties: false,
          required: [
            'inputRoot',
            'inputNullifierHash',
            'outputRoot',
            'outputPathIndices',
            'outputCommitment',
          ],
        },
      },
      additionalProperties: false,
      required: [
        'rate',
        'fee',
        'instance',
        'rewardNullifier',
        'extDataHash',
        'depositRoot',
        'withdrawalRoot',
        'extData',
        'account',
      ],
    },
  },
  additionalProperties: false,
  required: ['proof', 'args'],
}

const miningWithdrawSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    args: {
      type: 'object',
      properties: {
        amount: bytes32Type,
        extDataHash: bytes32Type,
        extData: {
          type: 'object',
          properties: {
            fee: bytes32Type,
            recipient: addressType,
            relayer: relayerType,
            encryptedAccount: encryptedAccountType,
          },
          additionalProperties: false,
          required: ['fee', 'relayer', 'encryptedAccount', 'recipient'],
        },
        account: {
          type: 'object',
          properties: {
            inputRoot: bytes32Type,
            inputNullifierHash: bytes32Type,
            outputRoot: bytes32Type,
            outputPathIndices: bytes32Type,
            outputCommitment: bytes32Type,
          },
          additionalProperties: false,
          required: [
            'inputRoot',
            'inputNullifierHash',
            'outputRoot',
            'outputPathIndices',
            'outputCommitment',
          ],
        },
      },
      additionalProperties: false,
      required: ['amount', 'extDataHash', 'extData', 'account'],
    },
  },
  additionalProperties: false,
  required: ['proof', 'args'],
}*/

const validatePgDarkPoolWithdraw = ajv.compile(pgDarkPoolWithdrawSchema)
const validatePgDarkPoolUniswapSS = ajv.compile(pgDarkPoolUniswapSSSchema)
const validatePgDarkPoolUniswapLP = ajv.compile(pgDarkPoolUniswapLPSchema)
//const validatePgDarkPoolUniswapMS = ajv.compile(pgDarkPoolUniswapMSSchema)

//const validateMiningReward = ajv.compile(miningRewardSchema)
//const validateMiningWithdraw = ajv.compile(miningWithdrawSchema)

function getInputError(validator, data) {
  validator(data)
  if (validator.errors) {
    const error = validator.errors[0]
    return `${error.dataPath} ${error.message}`
  }
  return null
}

function getPgDarkPoolWithdrawInputError(data) {
  return getInputError(validatePgDarkPoolWithdraw, data)
}

function getPgDarkPoolUniswapSSInputError(data) {
  return getInputError(validatePgDarkPoolUniswapSS, data)
}


function getPgDarkPoolUniswapLPInputError(data) {
  return getInputError(validatePgDarkPoolUniswapLP, data)
}

/*function getPgDarkPoolUniswapMSInputError(data) {
  return getInputError(validatePgDarkPoolUniswapMS, data)
}*/


/*function getMiningRewardInputError(data) {
  return getInputError(validateMiningReward, data)
}

function getMiningWithdrawInputError(data) {
  return getInputError(validateMiningWithdraw, data)
}*/

module.exports = {
  getPgDarkPoolWithdrawInputError,
  getPgDarkPoolUniswapSSInputError,
  //getPgDarkPoolUniswapMSInputError,
  getPgDarkPoolUniswapLPInputError,
  //getMiningRewardInputError,
  //getMiningWithdrawInputError,
}
