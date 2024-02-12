const fs = require('fs')
const { GasPriceOracle } = require('gas-price-oracle')
const pgDarkPoolABI = require('../abis/pgDarkPool.abi')
const pgDarkPoolUniswapABI = require('../abis/pgDarkPoolUniswap.abi')
const pgDarkPoolCurveMultiExchangeABI = require('../abis/pgDarkPoolCurveMultiExchange.abi')
const pgDarkPoolCurveSPPABI = require('../abis/pgDarkPoolCurveSPP.abi')
const pgDarkPoolCurveSLPABI = require('../abis/pgDarkPoolCurveSLP.abi')
const pgDarkPoolCurveCPABI = require('../abis/pgDarkPoolCurveCP.abi')


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
const { jobType, status } = require('./config/constants')
const {
  pgDarkPoolAssetManager,
  pgDarkPoolUniswapAssetManager,
  pgDarkPoolCurveMultiExchangeAssetManager,
  pgDarkPoolCurveSPPAssetManager,
  pgDarkPoolCurveSLPAssetManager,
  pgDarkPoolCurveCPAssetManager,
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
  let calldata
  const darkPoolContract = new web3.eth.Contract(pgDarkPoolABI, pgDarkPoolAssetManager)
  const uniswapContract = new web3.eth.Contract(pgDarkPoolUniswapABI.abi, pgDarkPoolUniswapAssetManager)
  const curveMultiExchangeContract = new web3.eth.Contract(pgDarkPoolCurveMultiExchangeABI.abi, pgDarkPoolCurveMultiExchangeAssetManager)
  const curveSPPContract = new web3.eth.Contract(pgDarkPoolCurveSPPABI.abi, pgDarkPoolCurveSPPAssetManager)
  const curveSLPContract = new web3.eth.Contract(pgDarkPoolCurveSLPABI.abi, pgDarkPoolCurveSLPAssetManager)
  const curveCPContract = new web3.eth.Contract(pgDarkPoolCurveCPABI.abi, pgDarkPoolCurveCPAssetManager)

  if (data.type === jobType.PG_DARKPOOL_WITHDRAW) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_WITHDRAW)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    if (isETH(data.asset)) {
      calldata = darkPoolContract.methods.withdrawETH(data.proof, data.merkleRoot, data.nullifier, data.recipient, data.relayer, data.refund, data.amount).encodeABI()
    } else {
      calldata = darkPoolContract.methods.withdrawERC20(data.asset, data.assetMod, data.proof, data.merkleRoot, data.nullifier, data.recipient, data.relayer, data.refund, data.amount).encodeABI()
    }
    return {
      to: darkPoolContract._address,
      data: calldata,
      gasLimit: gasLimits['WITHDRAW_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    calldata = uniswapContract.methods.uniswapSimpleSwap({
      inNoteData: {
        assetAddress: data.asset,
        amount: data.amount,
        nullifier: data.nullifier,
      },
      merkleRoot: data.merkleRoot,
      assetOut: data.assetOut,
      relayer: data.relayer,
      amountOutMin: data.amountOutMin,
      noteFooter: data.noteFooterOut,
      relayerGasFee: data.refund,
      poolFee: data.poolFee,
    }, data.proof).encodeABI()
    return {
      to: uniswapContract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_UNISWAP_LP) {
    // const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_UNISWAP_LP)
    // if (!validProof) {
    //   throw new RelayerError('Invalid proof')
    // }
    const param = {
      noteData1: {
        assetAddress: data.asset1,
        amount: data.amount1,
        nullifier: data.nullifier1,
      },
      noteData2: {
        assetAddress: data.asset2,
        amount: data.amount2,
        nullifier: data.nullifier2,
      },
      relayer: data.relayer,
      relayerGasFees: [data.refundToken1, data.refundToken2],
      merkleRoot: data.merkleRoot,
      amountForToken2: data.amountForToken2,
      noteFooterForSplittedNote: data.noteFooterForSplittedNote,
      noteFooterForChangeNote: data.noteFooterForChangeNote,
      tickMin: data.tickMin,
      tickMax: data.tickMax,
      outNoteFooter: data.outNoteFooter,
      poolFee: data.poolFee,
    }
    console.log(param)
    calldata = uniswapContract.methods.uniswapLiquidityProvision(param, data.proof).encodeABI()
    return {
      to: uniswapContract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    const param = {
      merkleRoot: data.merkleRoot,
      positionNoteCommitment: data.positionNoteCommitment,
      tokenId: data.tokenId,
      feeNoteFooters: [data.feeNoteFooter1, data.feeNoteFooter2],
      relayerGasFees: [data.relayerGasFeeFromToken1, data.relayerGasFeeFromToken2],
      relayer: data.relayer,
    }
    console.log(param)
    calldata = uniswapContract.methods.uniswapCollectFees(param, data.proof).encodeABI()
    return {
      to: uniswapContract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    const param = {
      merkleRoot: data.merkleRoot,
      positionNote:{
        assetAddress: data.nftAddress,
        amount: data.tokenId,
        nullifier: data.nullifier,
      },
      outNoteFooters: [data.outNoteFooter1, data.outNoteFooter2],
      relayerGasFees: [data.relayerGasFeeFromToken1, data.relayerGasFeeFromToken2],
      relayer: data.relayer,
    }
    console.log(param)
    calldata = uniswapContract.methods.uniswapRemoveLiquidity(param, data.proof).encodeABI()    
    return {
      to: uniswapContract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    const exchangeArgs = {
      merkleRoot: data.merkleRoot,
      nullifier: data.nullifier,
      assetIn: data.assetIn,
      amountIn: data.amountIn,
      route: data.routes,
      swapParams: data.swapParams,
      pools: data.pools,
      routeHash: data.routeHash,
      assetOut: data.assetOut,
      noteFooter: data.noteFooterOut,
      relayer: data.relayer,
      gasRefund: data.gasRefund,
    }
    console.log(exchangeArgs)
    calldata = curveMultiExchangeContract.methods.curveMultiExchange(
      data.proof,
      exchangeArgs,
    ).encodeABI()
    return {
      to: curveMultiExchangeContract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    let address
    if (data.useUnderlying !== undefined) {
      calldata = curveSLPContract.methods.curveAddLiquidity().encodeABI()
      address = curveSLPContract._address
    }else if (data.isETH !== undefined) {
      calldata = curveCPContract.methods.curveAddLiquidity().encodeABI()
      address = curveCPContract._address
    }else{
      calldata = curveSPPContract.methods.curveAddLiquidity().encodeABI()
      address = curveSPPContract._address
    }
    return {
      to: address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if (data.type === jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY) {
    const validProof = await zkProofVerifier(web3, data.proof, data.verifierArgs, jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY)
    if (!validProof) {
      throw new RelayerError('Invalid proof')
    }
    let address
    if (data.useUnderlying !== undefined) {
      calldata = curveSLPContract.methods.curveAddLiquidity().encodeABI()
      address = curveSLPContract._address
    }else if (data.isETH !== undefined) {
      calldata = curveCPContract.methods.curveAddLiquidity().encodeABI()
      address = curveCPContract._address
    }else{
      calldata = curveSPPContract.methods.curveAddLiquidity().encodeABI()
      address = curveSPPContract._address
    }
    return {
      to: address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
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
        console.log('Mined in block', receipt.blockNumber)
        updateStatus(status.MINED)
      })
      .on('confirmations', updateConfirmations)

    if (receipt.status === 1) {
      await updateStatus(status.CONFIRMED)
    } else {
      throw new RelayerError('Submitted transaction failed')
    }
  } catch (e) {
    throw new RelayerError(`Revert by smart contract ${e.message}`)
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
