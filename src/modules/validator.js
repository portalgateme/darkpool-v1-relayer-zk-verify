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
const curvePoolType = { type: 'string', enum: ['META', 'FSN', 'NORMAL'] }
const curveBasePoolType = { type: 'integer', enum: [0, 1, 2] }

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
    refund: bytes32Type,
    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: new Array(6).fill(bytes32Type),
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
      maxItems: 9,
      minItems: 9,
      items: new Array(9).fill(bytes32Type),
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
    changeNoteFooter1: bytes32Type,
    changeNoteFooter2: bytes32Type,
    tickMin: int24Type,
    tickMax: int24Type,
    deadline: Uint256Type,
    outNoteFooter: bytes32Type,
    feeTier: bytes32Type,
    amountMin1: Uint256Type,
    amountMin2: Uint256Type,

    verifierArgs: {
      type: 'array',
      maxItems: 19,
      minItems: 19,
      items: new Array(19).fill(bytes32Type),
    }
  },
  additionalProperties: true,
  required: ['asset1', 'asset2', 'amount1', 'amount2', 'nullifier1', 'nullifier2',
    'relayer', 'refundToken1', 'refundToken2', 'merkleRoot', 'changeNoteFooter1', 'changeNoteFooter2',
    'tickMin', 'tickMax', 'deadline', 'outNoteFooter', 'feeTier', 'amountMin1', 'amountMin2',
    'proof', 'verifierArgs'],
}

const pgDarkPoolUniswapFeeCollectingSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    tokenId: Uint256Type,
    feeNoteFooter1: bytes32Type,
    feeNoteFooter2: bytes32Type,
    relayerGasFeeFromToken1: bytes32Type,
    relayerGasFeeFromToken2: bytes32Type,
    relayer: relayerType,

    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: new Array(6).fill(bytes32Type),
    }
  },
  additionalProperties: false,
  required: ['proof', 'merkleRoot', 'tokenId', 'feeNoteFooter1', 'feeNoteFooter2',
    'relayerGasFeeFromToken1', 'relayerGasFeeFromToken2', 'relayer', 'verifierArgs'],
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
    deadline: Uint256Type,
    amount1Min: Uint256Type,
    amount2Min: Uint256Type,

    verifierArgs: {
      type: 'array',
      maxItems: 10,
      minItems: 10,
      items: new Array(10).fill(bytes32Type),
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
    minExpectedAmountOut: bytes32Type,
    noteFooterOut: bytes32Type,
    relayer: relayerType,
    gasRefund: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 9,
      minItems: 9,
      items: new Array(9).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'assetIn', 'amountIn', 'routes', 'swapParams',
    'pools', 'routeHash', 'assetOut', 'minExpectedAmountOut', 'noteFooterOut', 'relayer', 'gasRefund', 'verifierArgs'
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
    poolType: curvePoolType,
    basePoolType: curveBasePoolType,
    lpToken: assetType,
    poolFlag: bytes32Type,
    booleanFlag: { "type": "boolean" },
    minMintAmount: bytes32Type,
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
      maxItems: 19,
      minItems: 19,
      items: new Array(19).fill(bytes32Type),
    },
  },
  additionalProperties: true,
  required: [
    'proof', 'merkleRoot', 'nullifiers', 'assets', 'amounts', 'pool',
    'lpToken', 'poolType', 'basePoolType', 'poolFlag', 'booleanFlag',
    'minMintAmount', 'noteFooter', 'relayer', 'gasRefund', 'verifierArgs'
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
    poolType: curvePoolType,
    basePoolType: curveBasePoolType,
    poolFlag: bytes32Type,
    booleanFlag: { "type": "boolean" },
    assetsOut: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: [Uint256Type, Uint256Type, Uint256Type, Uint256Type]
    },
    minExpectedAmountsOut: {
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
      maxItems: 22,
      minItems: 22,
      items: new Array(22).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'asset', 'amount', 'amountBurn',
    'pool', 'assetsOut', 'poolType', 'basePoolType', 'poolFlag', 'booleanFlag', 'noteFooters', 'relayer', 'gasRefund', 'verifierArgs'
  ],
}

const pgDarkPoolZkStakeSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    inNullifier: bytes32Type,
    inAsset: assetType,
    inAmount: Uint256Type,
    outNoteFooter: bytes32Type,
    relayer: relayerType,
    refund: Uint256Type,
    verifierArgs: {
      type: 'array',
      maxItems: 7,
      minItems: 7,
      items: new Array(7).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'inNullifier', 'inAsset', 'inAmount',
    'outNoteFooter','relayer', 'refund', 'verifierArgs'
  ],
}


const pgDarkPoolZkRedeemSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    inNullifier: bytes32Type,
    inAsset: assetType,
    inAmount: Uint256Type,
    outNoteFooter: bytes32Type,
    relayer: relayerType,
    refund: Uint256Type,
    verifierArgs: {
      type: 'array',
      maxItems: 7,
      minItems: 7,
      items: new Array(7).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'inNullifier', 'inAsset', 'inAmount',
    'outNoteFooter','relayer', 'refund', 'verifierArgs'
  ],
}

const pgDarkPoolRocketPoolStakeSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nullifier: bytes32Type,
    amount: Uint256Type,
    noteFooterOut: bytes32Type,
    relayer: relayerType,
    refund: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: new Array(6).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'noteFooterOut',
    'amount', 'relayer', 'refund', 'verifierArgs'
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
const validatePgDarkPoolZkStake = ajv.compile(pgDarkPoolZkStakeSchema)
const validatePgDarkPoolZkRedeem = ajv.compile(pgDarkPoolZkRedeemSchema)
const validatePgDarkPoolRocketPoolStake = ajv.compile(pgDarkPoolRocketPoolStakeSchema)
const validatePgDarkPoolRocketPoolUnStake = ajv.compile(pgDarkPoolRocketPoolStakeSchema)



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

function getPgDarkPoolZkStakeInputError(data) {
  return getInputError(validatePgDarkPoolZkStake, data)
}

function getPgDarkPoolZkRedeemInputError(data) {
  return getInputError(validatePgDarkPoolZkRedeem, data)
}

function getPgDarkPoolRocketPoolStakeInputError(data) {
  return getInputError(validatePgDarkPoolRocketPoolStake, data)
}

function getPgDarkPoolRocketPoolUnStakeInputError(data) {
  return getInputError(validatePgDarkPoolRocketPoolUnStake, data)
}

module.exports = {
  getPgDarkPoolWithdrawInputError,
  getPgDarkPoolUniswapSSInputError,
  getPgDarkPoolUniswapLPInputError,
  getPgDarkPoolUniswapFeeCollectingInputError,
  getPgDarkPoolUniswapRemoveLiquidityInputError,
  getPgDarkPoolCurveMultiExchangeInputError,
  getPgDarkPoolCurveAddLiquidityInputError,
  getPgDarkPoolCurveRemoveLiquidityInputError,
  getPgDarkPoolZkStakeInputError,
  getPgDarkPoolZkRedeemInputError,
  getPgDarkPoolRocketPoolStakeInputError,
  getPgDarkPoolRocketPoolUnStakeInputError
}
