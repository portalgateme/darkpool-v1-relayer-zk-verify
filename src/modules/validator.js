const { isAddress, toChecksumAddress } = require('web3-utils')
const { isETH } = require('../utils')
const { rewardAccount } = require('../config/config')

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

ajv.addKeyword('isETH', {
  validate: (schema, data) => {
    try {
      return isETH(data)
    } catch (e) {
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
const Uint256Type = { type: 'string', pattern: '^0x[a-fA-F0-9]{1,64}$' }
const int24Type = { type: 'string', pattern: '^0x[a-fA-F0-9]{1,6}$' }
const assetType = { ...addressType, isETH: true }
const relayerType = { ...addressType, isFeeRecipient: true }

const pgDarkPoolWithdrawSchema = {
  type: 'object',
  properties: {
    asset: assetType,
    proof: proofType,
    merkleRoot:bytes32Type,
    nullifier: bytes32Type,
    recipient: addressType,
    relayer: relayerType,
    amount: Uint256Type,
    fee: bytes32Type,
    refund: bytes32Type,
    verifierArgs: {
      type: 'array',
      maxItems: 5,
      minItems: 5,
      items: [bytes32Type, bytes32Type, bytes32Type, bytes32Type, bytes32Type],
    }
  },
  additionalProperties: false,
  required: [
              'asset', 'proof', 'merkleRoot', 'nullifier', 
              'recipient', 'relayer', 'amount', 'verifierArgs'
            ],
}

const pgDarkPoolUniswapSSSchema = {
  type: 'object',
  properties: {
    asset: assetType,
    proof: proofType,
    merkleRoot:bytes32Type,
    nullifier: bytes32Type,
    assetOut: assetType,
    noteFooterOut:bytes32Type,
    relayer: relayerType,
    amount: Uint256Type,
    fee: bytes32Type,
    refund: bytes32Type,
   
    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: [bytes32Type, assetType, assetType, bytes32Type,Uint256Type, bytes32Type],
    },
  },
  additionalProperties: false,
  required: [
              'asset', 'proof', 'merkleRoot', 'nullifier', 
              'assetOut', 'relayer', 'amount', 'verifierArgs'
            ],
}

const pgDarkPoolUniswapLPSchema = {
  type: 'object',
  properties: {
    asset1: assetType,
    asset2: assetType,
    proof: proofType,
    merkleRoot:bytes32Type,
    nullifier1: bytes32Type,
    nullifier2: bytes32Type,
    noteFooterOut:bytes32Type,
    relayer: relayerType,
    amount1: Uint256Type,
    amount2: Uint256Type,
    tickMin: int24Type,
    tickMax:int24Type,
    poolFee: bytes32Type,
    fee: bytes32Type,
    refund: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 10,
      minItems: 10,
      items: [
                bytes32Type, assetType, assetType, Uint256Type, Uint256Type,
                bytes32Type, int24Type,int24Type, bytes32Type, bytes32Type
              ],
    }
  },
  additionalProperties: false,
  required: ['asset', 'proof', 'args'],
}

const pgDarkPoolUniswapFeeCollectingSchema = {}
const pgDarkPoolUniswapRemoveLiquiditySchema ={}

const pgDarkPoolCurveExchangeSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot:bytes32Type,
    nullifier: bytes32Type,
    assetIn: assetType,
    amountIn: Uint256Type,
    pool: addressType,
    assetOut: assetType,
    noteFooter:bytes32Type,
    relayer: relayerType,
    fee: bytes32Type,
    refund: bytes32Type,
   
    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: [
                bytes32Type, assetType, Uint256Type, bytes32Type,
                addressType,assetType, bytes32Type
              ],
    },
  },
  additionalProperties: false,
  required: [
              'proof', 'merkleRoot', 'nullifier', 'assetIn', 'amoutIn',
              'pool','assetOut', 'noteFooter','relayer', 'verifierArgs'
            ],
}

const pgDarkPoolCurveLPSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot:bytes32Type,
    nullifiers: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [bytes32Type, bytes32Type, bytes32Type, bytes32Type]
    },
    assets: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [assetType, assetType, assetType, assetType]
    },
    amounts: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [Uint256Type, Uint256Type, Uint256Type, Uint256Type]
    },
    pool: addressType,
    noteFooters:{
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [bytes32Type, bytes32Type, bytes32Type, bytes32Type]
    },
    relayer: relayerType,
    fee: bytes32Type,
    refund: bytes32Type,
   
    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: [
                bytes32Type,
                // [bytes32Type, bytes32Type, bytes32Type, bytes32Type],
                // [assetType, assetType, assetType, assetType],
                // [Uint256Type, Uint256Type, Uint256Type, Uint256Type],
                addressType,
                // [bytes32Type, bytes32Type, bytes32Type, bytes32Type],
              ],
    },
  },
  additionalProperties: false,
  required: [
              'proof', 'merkleRoot', 'nullifiers', 'assets', 'amouts',
              'pool','noteFooters','relayer', 'verifierArgs'
            ],
}

const pgDarkPoolCurveRemoveLiquiditySchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot:bytes32Type,
    nullifier: bytes32Type,
    asset: assetType,
    amount: Uint256Type,
    pool: addressType,
    assetsOut: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [Uint256Type, Uint256Type, Uint256Type, Uint256Type]
    },
    noteFooters:{
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [bytes32Type, bytes32Type, bytes32Type, bytes32Type]
    },
    relayer: relayerType,
    fee: bytes32Type,
    refund: bytes32Type,
   
    verifierArgs: {
      type: 'array',
      maxItems: 7,
      minItems: 7,
      items: [
                bytes32Type,
                bytes32Type,
                assetType,
                Uint256Type,
                addressType,
                // [assetType,assetType, assetType, assetType],
                // [bytes32Type, bytes32Type, bytes32Type, bytes32Type],
              ],
    },
  },
  additionalProperties: false,
  required: [
              'proof', 'merkleRoot', 'nullifier', 'asset', 'amout',
              'pool','assetsOut', 'noteFooters','relayer', 'verifierArgs'
            ],
}

const validatePgDarkPoolWithdraw = ajv.compile(pgDarkPoolWithdrawSchema)
const validatePgDarkPoolUniswapSS = ajv.compile(pgDarkPoolUniswapSSSchema)
const validatePgDarkPoolUniswapLP = ajv.compile(pgDarkPoolUniswapLPSchema)
const validatePgDarkPoolUniswapFeeCollecting = ajv.compile(pgDarkPoolUniswapFeeCollectingSchema)
const validatePgDarkPoolUniswapRemoveLiquidity = ajv.compile(pgDarkPoolUniswapRemoveLiquiditySchema)
const validatePgDarkPoolCurveExchange = ajv.compile(pgDarkPoolCurveExchangeSchema)
const validatePgDarkPoolCurveLP = ajv.compile(pgDarkPoolCurveLPSchema)
const validatePgDarkPoolCurveRemoveLiquidity = ajv.compile(pgDarkPoolCurveRemoveLiquiditySchema)

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

function getPgDarkPoolUniswapFeeCollectingInputError(data) {
  return getInputError(validatePgDarkPoolUniswapFeeCollecting, data)
}

function getPgDarkPoolUniswapRemoveLiquidityInputError(data) {
  return getInputError(validatePgDarkPoolUniswapRemoveLiquidity, data)
}

function getPgDarkPoolCurveExchangeInputError(data) {
  return getInputError(validatePgDarkPoolCurveExchange, data)
}

function getPgDarkPoolCurveLPInputError(data) {
  return getInputError(validatePgDarkPoolCurveLP, data)
}

function getPgDarkPoolCurveRemoveLiquidityInputError(data) {
  return getInputError(validatePgDarkPoolCurveRemoveLiquidity, data)
}

module.exports = {
  getPgDarkPoolWithdrawInputError,
  getPgDarkPoolUniswapSSInputError,
  getPgDarkPoolUniswapLPInputError,
  getPgDarkPoolUniswapFeeCollectingInputError,
  getPgDarkPoolUniswapRemoveLiquidityInputError,
  getPgDarkPoolCurveExchangeInputError,
  getPgDarkPoolCurveLPInputError,
  getPgDarkPoolCurveRemoveLiquidityInputError
}
