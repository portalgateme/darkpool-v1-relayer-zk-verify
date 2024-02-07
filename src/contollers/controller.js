const {
  getPgDarkPoolWithdrawInputError,
  getPgDarkPoolUniswapSSInputError,
  getPgDarkPoolUniswapLPInputError,
  getPgDarkPoolUniswapRemoveLiquidityInputError,
  getPgDarkPoolUniswapFeeCollectingInputError,
  //getPgDarkPoolUniswapMSInputError,
  //getMiningRewardInputError,
  //getMiningWithdrawInputError
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
/*async function pgDarkPoolUniswapMultihopSwap(req, res) {
  const inputError = getPgDarkPoolUniswapMSInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_DARKPOOL_UNISWAP_MULTIHOPSWAP,
    request: req.body,
  })
  return res.json({ id })
}*/

/*async function miningReward(req, res) {
  const inputError = getMiningRewardInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.MINING_REWARD,
    request: req.body,
  })
  return res.json({ id })
}

async function miningWithdraw(req, res) {
  const inputError = getMiningWithdrawInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.MINING_WITHDRAW,
    request: req.body,
  })
  return res.json({ id })
}*/

module.exports = {
  pgDarkPoolWithdraw,
  pgDarkPoolUniswapSingleSwap,
  // pgDarkPoolUniswapMultihopSwap,
  pgDarkPoolUniswapLP,
  pgDarkPoolUniswapCollectFees,
  pgDarkPoolUniswapRemoveLiquidity,
  //miningReward,
  //miningWithdraw,
}
