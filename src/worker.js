const fs = require('fs')
const { GasPriceOracle } = require('gas-price-oracle')
const pgDarkPoolABI = require('../abis/pgDarkPool.abi.json')
const pgDarkPoolUniswapSwapABI = require('../abis/pgDarkPoolUniswapSwapAssetManager.abi.json')
const pgDarkPoolUniswapLiquidityABI = require('../abis/pgDarkPoolUniswapLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMultiExchangeABI = require('../abis/pgDarkPoolCurveMultiExchange.abi.json')
const pgDarkPoolCurveAddLiquidityABI = require('../abis/pgDarkPoolCurveAddliquidityAssetManager.abi.json')
const pgDarkPoolCurveRemoveLiquidityABI = require('../abis/pgDarkPoolCurveRemoveliquidityAssetManager.abi.json')
const pgDarkPoolCurveFSNAddLiquidityABI = require('../abis/pgDarkPoolCurveFSNAddLiquidityAssetManager.abi.json')
const pgDarkPoolCurveFSNRemoveLiquidityABI = require('../abis/pgDarkPoolCurveFSNRemoveLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMPAddLiquidityABI = require('../abis/pgDarkPoolCurveMPAddLiquidityAssetManager.abi.json')
const pgDarkPoolCurveMPRemoveLiquidityABI = require('../abis/pgDarkPoolCurveMPRemoveLiquidityAssetManager.abi.json')
const { WithdrawWorker } = require('./worker/withdrawWorker')
const { UniswapSingleSwapWorker } = require('./worker/uniswapSingleSwapWorker')
const { UniswapAddLiquidityWorker } = require('./worker/uniswapAddLiquidityWorker')
const { UniswapRemoveLiquidityWorker } = require('./worker/uniswapRemoveLiquidityWorker')
const { UniswapCollectFeesWorker } = require('./worker/uniswapCollectFeesWorker')
const { CurveMultiExchangeWorker } = require('./worker/curveMultiExchangeWorker')
const { CurveAddLiquidityWorker } = require('./worker/curveAddLiquidityWorker')
const { CurveRemoveLiquidityWorker } = require('./worker/curveRemoveLiquidityWorker')

const erc20ABI = require('../abis/erc20Simple.abi')
const { queue } = require('./queue')
const {
  toBN,
  toWei,
  fromWei,
  RelayerError,
  logRelayerError,
  isETH,
  toChecksumAddress,
  getRateToEth,
} = require('./utils')
const { jobType, status, POOL_TYPE } = require('./config/constants')
const {
  pgDarkPoolAssetManager,
  pgDarkPoolUniswapSwapAssetManager,
  pgDarkPoolUniswapLiquidityAssetManager,
  pgDarkPoolCurveMultiExchangeAssetManager,
  pgDarkPoolCurveAddLiquidityAssetManager,
  pgDarkPoolCurveRemoveLiquidityAssetManager,
  pgDarkPoolCurveFSNAddLiquidityAssetManager,
  pgDarkPoolCurveFSNRemoveLiquidityAssetManager,
  pgDarkPoolCurveMPAddLiquidityAssetManager,
  pgDarkPoolCurveMPRemoveLiquidityAssetManager,
  gasLimits,
  privateKey,
  httpRpcUrl,
  oracleRpcUrl,
  baseFeeReserve,
  pgServiceFee,
} = require('./config/config')
const { TxManager } = require('tx-manager')
const { redis, redisSubscribe } = require('./modules/redis')
const getWeb3 = require('./modules/web3')
const { zkProofVerifier } = require('./modules/verifier')

let web3
let currentTx
let currentJob
let txManager
const gasPriceOracle = new GasPriceOracle({ defaultRpc: oracleRpcUrl })


const workerMapping = {
  [jobType.PG_DARKPOOL_WITHDRAW]: new WithdrawWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP]: new UniswapSingleSwapWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_LP]: new UniswapAddLiquidityWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY]: new UniswapRemoveLiquidityWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING]: new UniswapCollectFeesWorker(),
  [jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE]: new CurveMultiExchangeWorker(),
  [jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY]: new CurveAddLiquidityWorker(),
  [jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY]: new CurveRemoveLiquidityWorker(),
}

async function start() {
  try {
    await clearErrors()
    web3 = getWeb3()
    const { CONFIRMATIONS, MAX_GAS_PRICE } = process.env
    txManager = new TxManager({
      privateKey,
      rpcUrl: httpRpcUrl,
      config: {
        CONFIRMATIONS,
        MAX_GAS_PRICE,
        THROW_ON_REVERT: false,
        BASE_FEE_RESERVE_PERCENTAGE: baseFeeReserve,
      },
    })
    queue.process(processJob)
    console.log('Worker started')
  } catch (e) {
    await logRelayerError(redis, e)
    console.error('error on start worker', e.message)
  }
}


async function getGasPrice() {
  const block = await web3.eth.getBlock('latest')

  if (block && block.baseFeePerGas) {
    return toBN(block.baseFeePerGas)
  }

  const { fast } = await gasPriceOracle.gasPrices()
  return toBN(toWei(fast.toString(), 'gwei'))
}

async function checkPgFee(asset, amount, fee, refund) {
  const isEth = isETH(asset)
  const gasPrice = await getGasPrice()
  const expense = gasPrice.mul(toBN(gasLimits[jobType.PG_DARKPOOL_WITHDRAW]))

  amount = toBN(amount)
  fee = toBN(fee)
  refund = toBN(refund)

  if (fee.lt(refund) || amount.lt(fee)) {
    throw new RelayerError('Provided fee is not enough. Probably it is a Gas Price spike, try to resubmit.', 0)
  }

  let serviceFee
  let desiredFee
  let decimals

  if (isEth) {
    serviceFee = amount.mul(toBN(parseInt(pgServiceFee * 1e10))).div(toBN(1e10 * 100))
    decimals = 18
  } else {
    const erc20 = new web3.eth.Contract(erc20ABI, toChecksumAddress(asset))
    decimals = await erc20.methods.decimals().call()
    const ethRate = await redis.hget('rates', asset)

    if (!ethRate) {
      ethRate = await getRateToEth(asset, decimals, true)
    }

    serviceFee = toBN(amount)
      .mul(toBN(ethRate))
      .div(toBN(10).pow(toBN(decimals)))
      .mul(toBN(parseInt(pgServiceFee * 1e10))).div(toBN(1e10 * 100))
  }
  desiredFee = expense.add(serviceFee)
  console.log(
    'sent fee, desired fee, serviceFee',
    fromWei(fee.toString()),
    fromWei(desiredFee.toString()),
    fromWei(serviceFee.toString()),
  )
  if (fee.lt(desiredFee)) {
    throw new RelayerError(
      'Provided fee is not enough. Probably it is a Gas Price spike, try to resubmit.',
      0,
    )
  }
}

async function getTxObject({ data }) {
  const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, data.type)
  if (!validProof) {
    throw new RelayerError('Invalid proof')
  }

  const worker = workerMapping[data.type]
  if (worker) {
    const gasAmount = await worker.estimateGas(web3, data)
    const gasPrice = await getGasPrice()
    const gasFee = gasPrice.mul(toBN(gasAmount))

    return worker.getTxObj(web3, data, gasFee)
  } else {
    throw new RelayerError(`Unknown job type: ${data.type}`)
  }
}

async function processJob(job) {
  try {
    if (!jobType[job.data.type]) {
      throw new RelayerError(`Unknown job type: ${job.data.type}`)
    }
    currentJob = job
    await updateStatus(status.ACCEPTED)
    console.log(`Start processing a new ${job.data.type} job #${job.id}`)
    await submitTx(job)
  } catch (e) {
    console.error('processJob', e.message, e.stack)
    await updateStatus(status.FAILED)
    throw new RelayerError(e.message)
  }
}

async function submitTx(job, retry = 0) {
  // await checkPgFee(job.data.asset, job.data.amount, job.data.fee, job.data.refund)

  currentTx = await txManager.createTx(await getTxObject(job))

  try {
    const receipt = await currentTx
      .send()
      .on('transactionHash', txHash => {
        updateTxHash(txHash)
        updateStatus(status.SENT)
      })
      .on('mined', receipt => {
        updateStatus(status.MINED)
      })
      .on('confirmations', updateConfirmations)

    if (receipt.status === 1) {
      await updateStatus(status.CONFIRMED)
    } else {
      throw new RelayerError('Submitted transaction failed')
    }
  } catch (e) {
    throw new RelayerError(`Revert by smart contract ${e.message} ${e.stack}`)
  }
}

async function updateTxHash(txHash) {
  console.log(`A new successfully sent tx ${txHash}`)
  currentJob.data.txHash = txHash
  await currentJob.update(currentJob.data)
}

async function updateConfirmations(confirmations) {
  console.log(`Confirmations count ${confirmations}`)
  currentJob.data.confirmations = confirmations
  await currentJob.update(currentJob.data)
}

async function updateStatus(status) {
  console.log(`Job status updated ${status}`)
  currentJob.data.status = status
  await currentJob.update(currentJob.data)
}

async function clearErrors() {
  console.log('Errors list cleared')
  await redis.del('errors')
}

start()
