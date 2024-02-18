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
const int24Type = { type: 'integer' }
const intType = { type: 'interger' }
const assetType = { ...addressType }
const relayerType = { ...addressType, isFeeRecipient: true }
const curvePoolType = { type: 'string', enum: ['PLAIN', 'LENDING', 'META', 'CRYPTO'] }

const pgDarkPoolWithdrawSchema = {
  type: 'object',
  properties: {
    asset: assetType,
    proof: proofType,
    merkleRoot: bytes32Type,
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
      items: new Array(5).fill(bytes32Type),
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
    proof: proofType,
    merkleRoot: bytes32Type,
    asset: assetType,
    amount: Uint256Type,
    nullifier: bytes32Type,
    assetOut: assetType,
    amountOutMin: Uint256Type,
    noteFooterOut: bytes32Type,
    relayer: relayerType,
    fee: bytes32Type,
    refund: bytes32Type,
    poolFee: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: new Array(6).fill(bytes32Type),
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
    proof: proofType,
    asset1: assetType,
    amount1: Uint256Type,
    nullifier1: bytes32Type,
    asset2: assetType,
    amount2: Uint256Type,
    nullifier2: bytes32Type,
    relayer: relayerType,
    refundToken1: bytes32Type,
    refundToken2: bytes32Type,
    merkleRoot: bytes32Type,
    amountForToken2: Uint256Type,
    noteFooterForSplittedNote: bytes32Type,
    noteFooterForChangeNote: bytes32Type,
    tickMin: int24Type,
    tickMax: int24Type,
    outNoteFooter: bytes32Type,
    poolFee: bytes32Type,
    fee: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 12,
      minItems: 12,
      items: new Array(12).fill(bytes32Type),
    }
  },
  additionalProperties: false,
  required: ['asset1', 'asset2', 'proof', 'verifierArgs'],
}

const pgDarkPoolUniswapFeeCollectingSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    positionNoteCommitment: bytes32Type,
    tokenId: Uint256Type,
    feeNoteFooter1: bytes32Type,
    feeNoteFooter2: bytes32Type,
    relayerGasFeeFromToken1: bytes32Type,
    relayerGasFeeFromToken2: bytes32Type,
    relayer: relayerType,
    fee: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: new Array(6).fill(bytes32Type),
    }
  },
  additionalProperties: false,
  required: ['merkleRoot', 'positionNoteCommitment', 'tokenId', 'proof', 'verifierArgs'],
}
const pgDarkPoolUniswapRemoveLiquiditySchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nftAddress: assetType,
    tokenId: Uint256Type,
    nullifier: bytes32Type,
    outNoteFooter1: bytes32Type,
    outNoteFooter2: bytes32Type,
    relayerGasFeeFromToken1: bytes32Type,
    relayerGasFeeFromToken2: bytes32Type,
    relayer: relayerType,
    fee: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: new Array(6).fill(bytes32Type),
    }
  },
  additionalProperties: false,
  required: ['merkleRoot', 'nullifier', 'tokenId', 'proof', 'verifierArgs'],
}

const pgDarkPoolCurveMultiExchangeSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nullifier: bytes32Type,
    assetIn: assetType,
    amountIn: Uint256Type,
    routes: {
      type: 'array',
      maxItems: 11,
      minItems: 11,
      items: new Array(11).fill(addressType),
    },
    swapParams: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          intType, intType, intType, intType, intType
        }
      }
    },
    pools: {
      type: 'array',
      maxItems: 5,
      minItems: 5,
      items: new Array(5).fill(addressType),
    },
    routeHash: bytes32Type,
    assetOut: assetType,
    noteFooterOut: bytes32Type,
    relayer: relayerType,
    gasRefund: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 7,
      minItems: 7,
      items: new Array(7).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'assetIn', 'amountIn', 'routes', 'swapParams',
    'pools', 'routeHash', 'assetOut', 'noteFooterOut', 'relayer', 'gasRefund', 'verifierArgs'
  ],
}

const pgDarkPoolCurveAddLiquiditySchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nullifiers: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(bytes32Type)
    },
    assets: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(assetType)
    },
    amounts: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(Uint256Type)
    },
    pool: addressType,
    lpToken: assetType,
    isMetaReg: { "type": "boolean" },
    isPlain: { "type": "boolean" },
    isLegacy: { "type": "boolean" },
    booleanFlag: { "type": "boolean" },
    noteFooter: bytes32Type,
    relayer: relayerType,
    gasRefund: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(Uint256Type)
    },
    verifierArgs: {
      type: 'array',
      maxItems: 15,
      minItems: 15,
      items: new Array(15).fill(bytes32Type),
    },
  },
  additionalProperties: true,
  required: [
    'proof', 'merkleRoot', 'nullifiers', 'assets', 'amounts', 'pool',
    'lpToken','isMetaReg', 'isPlain', 'isLegacy', 'booleanFlag', 'noteFooter', 'relayer', 'gasRefund', 'verifierArgs'
  ],
}

const pgDarkPoolCurveRemoveLiquiditySchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nullifier: bytes32Type,
    asset: assetType,
    amount: Uint256Type,
    amountBurn: Uint256Type,
    pool: addressType,
    isMetaReg: { "type": "boolean" },
    isPlain: { "type": "boolean" },
    isLegacy: { "type": "boolean" },
    booleanFlag: { "type": "boolean" },
    assetsOut: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [Uint256Type, Uint256Type, Uint256Type, Uint256Type]
    },
    noteFooters: {
      type: 'array',
      maxItems: 5,
      minItems: 5,
      items: [bytes32Type, bytes32Type, bytes32Type, bytes32Type]
    },
    relayer: relayerType,
    gasRefund: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [Uint256Type, Uint256Type, Uint256Type, Uint256Type]
    },

    verifierArgs: {
      type: 'array',
      maxItems: 15,
      minItems: 15,
      items: new Array(15).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'asset', 'amount', 'amountBurn',
    'pool', 'assetsOut','isMetaReg', 'isPlain', 'isLegacy', 'booleanFlag', 'noteFooters', 'relayer', 'gasRefund', 'verifierArgs'
  ],
}

const validatePgDarkPoolWithdraw = ajv.compile(pgDarkPoolWithdrawSchema)
const validatePgDarkPoolUniswapSS = ajv.compile(pgDarkPoolUniswapSSSchema)
const validatePgDarkPoolUniswapLP = ajv.compile(pgDarkPoolUniswapLPSchema)
const validatePgDarkPoolUniswapFeeCollecting = ajv.compile(pgDarkPoolUniswapFeeCollectingSchema)
const validatePgDarkPoolUniswapRemoveLiquidity = ajv.compile(pgDarkPoolUniswapRemoveLiquiditySchema)
const validatePgDarkPoolCurveMultiExchange = ajv.compile(pgDarkPoolCurveMultiExchangeSchema)
const validatePgDarkPoolCurveAddLiquidity = ajv.compile(pgDarkPoolCurveAddLiquiditySchema)
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

function getPgDarkPoolCurveMultiExchangeInputError(data) {
  return getInputError(validatePgDarkPoolCurveMultiExchange, data)
}

function getPgDarkPoolCurveAddLiquidityInputError(data) {
  return getInputError(validatePgDarkPoolCurveAddLiquidity, data)
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
  getPgDarkPoolCurveMultiExchangeInputError,
  getPgDarkPoolCurveAddLiquidityInputError,
  getPgDarkPoolCurveRemoveLiquidityInputError
}
