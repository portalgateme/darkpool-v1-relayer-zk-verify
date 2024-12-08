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
const bytesType = { type: 'string', pattern: '^0x[a-fA-F0-9]*$' }

const pgDarkPoolWithdrawSchema = {
  type: 'object',
  properties: {
    asset: assetType,
    proof: proofType,
    nullifier: bytes32Type,
    recipient: addressType,
    relayer: relayerType,
    amount: Uint256Type,
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
    'asset', 'proof', 'nullifier',
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
    'outNoteFooter', 'relayer', 'refund', 'verifierArgs'
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
    'outNoteFooter', 'relayer', 'refund', 'verifierArgs'
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

const pgDarkPoolSablierClaimSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nullifier: bytes32Type,
    stream: addressType,
    streamId: Uint256Type,
    assetOut: addressType,
    amountOut: Uint256Type,
    noteFooterOut: bytes32Type,
    relayer: relayerType,
    refund: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 8,
      minItems: 8,
      items: new Array(8).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'noteFooterOut',
    'stream', 'streamId', 'assetOut', 'amountOut', 'relayer', 'refund', 'verifierArgs'
  ],
}

const pgDarkPoolDefiInfraSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    inNoteType: int24Type,
    inNullifiers: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(Uint256Type)
    },
    inAssets: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(assetType)
    },
    inAmountsOrNftIds: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(Uint256Type)
    },
    contractAddress: addressType,
    defiParameters: bytesType,
    defiParameterHash: bytes32Type,
    outNoteType: int24Type,
    outAssets: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(assetType)
    },
    outNoteFooters: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(Uint256Type)
    },
    relayer: relayerType,
    gasRefund: {
      type: 'array',
      maxItems: 4,
      minItems: 4,
      items: Array(4).fill(Uint256Type)
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
    'proof', 'merkleRoot', 'inNoteType', 'inNullifiers', 'inAssets', 'inAmountsOrNftIds', 'contractAddress',
    'defiParameters', 'defiParameterHash', 'outNoteType', 'outAssets', 'outNoteFooters', 'relayer', 'gasRefund', 'verifierArgs'
  ],
}

const pgDarkPoolAerodromeAddLiquiditySchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    inNullifier1: bytes32Type,
    inNullifier2: bytes32Type,
    inAsset1: assetType,
    inAsset2: assetType,
    inAmount1: Uint256Type,
    inAmount2: Uint256Type,
    pool: addressType,
    stable: { "type": "boolean" },
    amount1Min: Uint256Type,
    amount2Min: Uint256Type,
    deadline: Uint256Type,
    outNoteFooter: bytes32Type,
    outChangeFooter1: bytes32Type,
    outChangeFooter2: bytes32Type,
    relayer: relayerType,
    refundToken1: Uint256Type,
    refundToken2: Uint256Type,

    verifierArgs: {
      type: 'array',
      maxItems: 16,
      minItems: 16,
      items: new Array(16).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'inNullifier1', 'inNullifier2', 'inAsset1', 'inAsset2', 'inAmount1', 'inAmount2',
    'pool', 'stable', 'amount1Min', 'amount2Min', 'deadline', 'outNoteFooter', 'outChangeFooter1', 'outChangeFooter2',
    'relayer', 'refundToken1', 'refundToken2', 'verifierArgs'
  ],
}

const pgDarkPoolAerodromeRemoveLiquiditySchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    nullifier: bytes32Type,
    pool: addressType,
    amount: Uint256Type,
    amountBurn: Uint256Type,
    stable: { "type": "boolean" },
    outAsset1: assetType,
    outAsset2: assetType,
    outAmount1Min: Uint256Type,
    outAmount2Min: Uint256Type,
    deadline: Uint256Type,
    outNoteFooter1: bytes32Type,
    outNoteFooter2: bytes32Type,
    outChangeNoteFooter: bytes32Type,
    relayer: relayerType,
    refundToken1: bytes32Type,
    refundToken2: bytes32Type,

    verifierArgs: {
      type: 'array',
      maxItems: 15,
      minItems: 15,
      items: new Array(15).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'nullifier', 'pool', 'amount', 'amountBurn', 'stable',
    'outAsset1', 'outAsset2', 'outAmount1Min', 'outAmount2Min', 'deadline', 'outNoteFooter1', 'outNoteFooter2', 'outChangeNoteFooter',
    'relayer', 'refundToken1', 'refundToken2', 'verifierArgs'
  ],
}

const pgDarkPoolAerodromeSwapSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    merkleRoot: bytes32Type,
    inNullifier: bytes32Type,
    inAsset: assetType,
    inAmount: Uint256Type,
    routes: {
      type: 'array',
      minItems: 1,
      maxItems: 20,
      items: {
        type: 'object',
        properties: {
          from: addressType,
          to: addressType,
          stable: { type: 'boolean' },
          factory: addressType
        },
        required: ['from', 'to', 'stable', 'factory']
      }
    },
    routeHash: bytes32Type,
    minExpectedAmountOut: Uint256Type,
    deadline: Uint256Type,
    outNoteFooter: bytes32Type,
    relayer: relayerType,
    gasRefund: Uint256Type,
    verifierArgs: {
      type: 'array',
      maxItems: 9,
      minItems: 9,
      items: new Array(9).fill(bytes32Type),
    },
  },
  additionalProperties: false,
  required: [
    'proof', 'merkleRoot', 'inNullifier', 'inAsset', 'inAmount', 'routes', 'routeHash',
    'minExpectedAmountOut', 'deadline', 'outNoteFooter', 'relayer', 'gasRefund', 'verifierArgs'
  ],
}

const pgZkVerifySubmitProofSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    publicSignals: {
      type: 'array',
      items: bytes32Type,
      minItems: 1
    },
    vkHash: bytes32Type
  },
  required: ['proof', 'publicSignals', 'vkHash'],
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
const validatePgDarkPoolSablierClaim = ajv.compile(pgDarkPoolSablierClaimSchema)
const validatePgDarkPoolDefiInfra = ajv.compile(pgDarkPoolDefiInfraSchema)
const validatePgDarkPoolAerodromeAddLiquidity = ajv.compile(pgDarkPoolAerodromeAddLiquiditySchema)
const validatePgDarkPoolAerodromeRemoveLiquidity = ajv.compile(pgDarkPoolAerodromeRemoveLiquiditySchema)
const validatePgDarkPoolAerodromeSwap = ajv.compile(pgDarkPoolAerodromeSwapSchema)
const validatePgZkVerifySubmitProof = ajv.compile(pgZkVerifySubmitProofSchema)


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

function getPgDarkPoolSablierClaimInputError(data) {
  return getInputError(validatePgDarkPoolSablierClaim, data)
}

function getPgDarkPoolDefiInfraInputError(data) {
  return getInputError(validatePgDarkPoolDefiInfra, data)
}

function getPgDarkPoolAerodromeAddLiquidityInputError(data) {
  return getInputError(validatePgDarkPoolAerodromeAddLiquidity, data)
}

function getPgDarkPoolAerodromeRemoveLiquidityInputError(data) {
  return getInputError(validatePgDarkPoolAerodromeRemoveLiquidity, data)
}

function getPgDarkPoolAerodromeSwapInputError(data) {
  return getInputError(validatePgDarkPoolAerodromeSwap, data)
}

function getPgZkVerifySubmitProofInputError(data) {
  return getInputError(validatePgZkVerifySubmitProof, data)
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
  getPgDarkPoolRocketPoolUnStakeInputError,
  getPgDarkPoolSablierClaimInputError,
  getPgDarkPoolDefiInfraInputError,
  getPgDarkPoolAerodromeAddLiquidityInputError,
  getPgDarkPoolAerodromeRemoveLiquidityInputError,
  getPgDarkPoolAerodromeSwapInputError,
  getPgZkVerifySubmitProofInputError,
}
