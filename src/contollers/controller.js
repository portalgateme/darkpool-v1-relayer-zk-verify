const {
  getPgDarkPoolWithdrawInputError,
  getPgDarkPoolUniswapSSInputError,
  getPgDarkPoolUniswapLPInputError,
  getPgDarkPoolUniswapRemoveLiquidityInputError,
  getPgDarkPoolUniswapFeeCollectingInputError,
  getPgDarkPoolCurveMultiExchangeInputError,
  getPgDarkPoolCurveAddLiquidityInputError,
  getPgDarkPoolCurveRemoveLiquidityInputError,
  getPgDarkPoolZkStakeInputError,
  getPgDarkPoolZkRedeemInputError,
  getPgDarkPoolRocketPoolStakeInputError,
  getPgDarkPoolRocketPoolUnStakeInputError,
  getPgDarkPoolSablierClaimInputError,
  getPgDarkPoolDefiInfraInputError
} = require('../modules/validator')
const { postJob } = require('../queue')
const { jobType } = require('../config/constants')

async function pgDarkPoolWithdraw(req, res) {
  const inputError = getPgDarkPoolWithdrawInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_WITHDRAW,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolUniswapSingleSwap(req, res) {
  const inputError = getPgDarkPoolUniswapSSInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolUniswapRemoveLiquidity(req, res) {
  const inputError = getPgDarkPoolUniswapRemoveLiquidityInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolUniswapCollectFees(req, res) {
  const inputError = getPgDarkPoolUniswapFeeCollectingInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING,
    request: req.body,
  })
  return res.json({ id })
}


async function pgDarkPoolUniswapLP(req, res) {
  const inputError = getPgDarkPoolUniswapLPInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_UNISWAP_LP,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolCurveMultiExchange(req, res) {
  const inputError = getPgDarkPoolCurveMultiExchangeInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolCurveAddLiquidity(req, res) {
  const inputError = getPgDarkPoolCurveAddLiquidityInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolCurveRemoveLiquidity(req, res) {
  const inputError = getPgDarkPoolCurveRemoveLiquidityInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolZkStake(req, res) {
  const inputError = getPgDarkPoolZkStakeInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }
  const id = await postJob({
    type: jobType.PG_DARKPOOL_ZK_STAKE,
    request: req.body,
  })
  return res.json({ id })
}
 
async function pgDarkPoolRocketPoolStake(req, res) {
  const inputError = getPgDarkPoolRocketPoolStakeInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_ROCKET_POOL_STAKE,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolZkRedeem(req, res) {
  const inputError = getPgDarkPoolZkRedeemInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }
  
  const id = await postJob({
    type: jobType.PG_DARKPOOL_ZK_REDEEM,
    request: req.body,
  })
  return res.json({ id })
}
  
  
async function pgDarkPoolRocketPoolUnStake(req, res) {
  const inputError = getPgDarkPoolRocketPoolUnStakeInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_ROCKET_POOL_UNSTAKE,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolSablierClaim(req, res) {
  const inputError = getPgDarkPoolSablierClaimInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_SABLIER_CLAIM,
    request: req.body,
  })
  return res.json({ id })
}

async function pgDarkPoolDefiInfra(req, res) {
  const inputError = getPgDarkPoolDefiInfraInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_INFRA,
    request: req.body,
  })
  return res.json({ id })
}



module.exports = {
  pgDarkPoolWithdraw,
  pgDarkPoolUniswapSingleSwap,
  pgDarkPoolUniswapLP,
  pgDarkPoolUniswapCollectFees,
  pgDarkPoolUniswapRemoveLiquidity,
  pgDarkPoolCurveMultiExchange,
  pgDarkPoolCurveAddLiquidity,
  pgDarkPoolCurveRemoveLiquidity,
  pgDarkPoolZkStake,
  pgDarkPoolZkRedeem,
  pgDarkPoolRocketPoolStake,
  pgDarkPoolRocketPoolUnStake,
  pgDarkPoolSablierClaim,
  pgDarkPoolDefiInfra
}
