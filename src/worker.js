const { WithdrawWorker } = require('./worker/withdrawWorker')
const { UniswapSingleSwapWorker } = require('./worker/uniswapSingleSwapWorker')
const { UniswapAddLiquidityWorker } = require('./worker/uniswapAddLiquidityWorker')
const { UniswapRemoveLiquidityWorker } = require('./worker/uniswapRemoveLiquidityWorker')
const { UniswapCollectFeesWorker } = require('./worker/uniswapCollectFeesWorker')
const { CurveMultiExchangeWorker } = require('./worker/curveMultiExchangeWorker')
const { CurveAddLiquidityWorker } = require('./worker/curveAddLiquidityWorker')
const { CurveRemoveLiquidityWorker } = require('./worker/curveRemoveLiquidityWorker')
const { zkStakeWorker } = require('./worker/zkStakeWorker')
const { zkRedeemWorker } = require('./worker/zkRedeemWorker')
const { RocketPoolStakeWorker } = require('./worker/rocketPoolDepositWorker')
const { RocketPoolUnStakeWorker } = require('./worker/rocketPoolWithdrawWorker')
const { SablierClaimWorker } = require('./worker/sablierClaimWorker')
const { InfraWorker } = require('./worker/infraWorker')


const { queue } = require('./queue')
const {
  RelayerError,
  logRelayerError,
} = require('./utils')
const { jobType, status } = require('./config/constants')
const {
  privateKey,
  httpRpcUrl,
  oracleRpcUrl,
  baseFeeReserve,
  gasUnitFallback,
} = require('./config/config')
const { TxManager } = require('tx-manager')
const { redis, redisSubscribe } = require('./modules/redis')
const getWeb3 = require('./modules/web3')
const { zkProofVerifier } = require('./modules/verifier')
const { calcGasFee } = require('./modules/fees')

let web3
let currentTx
let currentJob
let txManager

const workerMapping = {
  [jobType.PG_DARKPOOL_WITHDRAW]: new WithdrawWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP]: new UniswapSingleSwapWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_LP]: new UniswapAddLiquidityWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY]: new UniswapRemoveLiquidityWorker(),
  [jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING]: new UniswapCollectFeesWorker(),
  [jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE]: new CurveMultiExchangeWorker(),
  [jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY]: new CurveAddLiquidityWorker(),
  [jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY]: new CurveRemoveLiquidityWorker(),
  [jobType.PG_DARKPOOL_ZK_STAKE]: new zkStakeWorker(),
  [jobType.PG_DARKPOOL_ZK_REDEEM]: new zkRedeemWorker(),
  [jobType.PG_DARKPOOL_ROCKET_POOL_STAKE]: new RocketPoolStakeWorker(),
  [jobType.PG_DARKPOOL_ROCKET_POOL_UNSTAKE]: new RocketPoolUnStakeWorker(),
  [jobType.PG_DARKPOOL_SABLIER_CLAIM]: new SablierClaimWorker(),
  [jobType.PG_DARKPOOL_INFRA]: new InfraWorker(),
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

async function getTxObject({ data }) {
  const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, data.type)
  if (!validProof) {
    throw new RelayerError('Invalid proof')
  }

  const worker = workerMapping[data.type]
  if (worker) {
    let gasAmount
    try {
      gasAmount = await worker.estimateGas(web3, data)
    } catch (e) {
      console.error(e, 'Estimation fallback', data.type)
      gasAmount = gasUnitFallback[data.type]
    }
    const gasFee = await calcGasFee(web3, gasAmount)
    return await worker.getTxObj(web3, data, gasFee)
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
