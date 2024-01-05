const fs = require('fs')
//const MerkleTree = require('fixed-merkle-tree')
const { GasPriceOracle } = require('gas-price-oracle')
//const { Controller } = require('tornado-anonymity-mining')
//const miningABI = require('../abis/mining.abi.json')
const pgDarkPoolABI = require('../abis/pgDarkPool.abi')
const erc20ABI = require('../abis/erc20Simple.abi')
const { queue } = require('./queue')
const {
  //poseidonHash2,
  //fromDecimals,
  //sleep,
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
  //minerAddress,
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
//let tree
let txManager
//let controller
//let minerContract
const gasPriceOracle = new GasPriceOracle({ defaultRpc: oracleRpcUrl })

/*async function fetchTree() {
  const elements = await redis.get('tree:elements')
  const convert = (_, val) => (typeof val === 'string' ? toBN(val) : val)
  tree = MerkleTree.deserialize(JSON.parse(elements, convert), poseidonHash2)

  if (currentTx && currentJob && ['MINING_REWARD', 'MINING_WITHDRAW'].includes(currentJob.data.type)) {
    const { proof, args } = currentJob.data
    if (toBN(args.account.inputRoot).eq(toBN(tree.root()))) {
      console.log('Account root is up to date. Skipping Root Update operation...')
      return
    } else {
      console.log('Account root is outdated. Starting Root Update operation...')
    }

    const update = await controller.treeUpdate(args.account.outputCommitment, tree)
    const instance = new web3.eth.Contract(miningABI, minerAddress)
    const data =
      currentJob.data.type === 'MINING_REWARD'
        ? instance.methods.reward(proof, args, update.proof, update.args).encodeABI()
        : instance.methods.withdraw(proof, args, update.proof, update.args).encodeABI()
    await currentTx.replace({
      to: minerAddress,
      data,
    })
    console.log('replaced pending tx')
  }
}*/

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
    //minerContract = new web3.eth.Contract(miningABI, minerAddress)
    //redisSubscribe.subscribe('treeUpdate', fetchTree)
    //await fetchTree()
   /* const provingKeys = {
      treeUpdateCircuit: require('../keys/TreeUpdate.json'),
      treeUpdateProvingKey: fs.readFileSync('./keys/TreeUpdate_proving_key.bin').buffer,
    }*/
    //controller = new Controller({ provingKeys })
    //await controller.init()
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
  
  if(fee.lt(refund) || amount.lt(fee) ){
    throw new RelayerError('Provided fee is not enough. Probably it is a Gas Price spike, try to resubmit.' , 0)
  }

  let serviceFee
  let desiredFee
  let decimals

  if(isEth){
    serviceFee = amount.mul(toBN(parseInt(pgServiceFee * 1e10))).div(toBN(1e10 * 100)) 
    decimals = 18
  } else{
    const erc20 = new web3.eth.Contract(erc20ABI, toChecksumAddress(asset))
    decimals = await erc20.methods.decimals().call()
    const ethRate = await redis.hget('rates', asset)
    
    if(!ethRate){
      ethRate  = await getRateToEth(asset,decimals,true)
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
  const contract = new web3.eth.Contract(pgDarkPoolABI, pgDarkPoolAssetManager)
 
  if (data.type === jobType.PG_DARKPOOL_WITHDRAW) {
    const validProof = await zkProofVerifier(web3,data.proof,data.verifierArgs,jobType.PG_DARKPOOL_WITHDRAW)
    if(!validProof){
        throw new RelayerError('Invalid proof')
    }
    if(isETH(data.asset)){
      calldata = contract.methods.withdrawETH(data.proof, data.merkleRoot, data.nullifier, data.recipient, data.relayer, data.amount).encodeABI()
    }else{
      calldata = contract.methods.withdrawERC20(data.asset, data.assetMod, data.proof, data.merkleRoot, data.nullifier, data.recipient, data.relayer, data.amount).encodeABI()
    }  
    return {
      to: contract._address,
      data: calldata,
      gasLimit: gasLimits['WITHDRAW_WITH_EXTRA'],
    }
  } else if(data.type === jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP){
    const validProof = await zkProofVerifier(web3,data.proof,data.verifierArgs,jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP)
    if(!validProof){
        throw new RelayerError('Invalid proof')
    }
    //calldata = contract.methods.uniswap_ss(data.asset, data.assetMod, data.proof, ...data.args).encodeABI()
    return {
      to: contract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if(data.type === jobType.PG_DARKPOOL_UNISWAP_LP){
    const validProof = await zkProofVerifier(web3,data.proof,data.verifierArgs,jobType.PG_DARKPOOL_CURVE_LP)
    if(!validProof){
        throw new RelayerError('Invalid proof')
    }
    //calldata = contract.methods.uniswap_lp(data.asset1, data.proof1,data.asset2, data.proof2, ...data.args).encodeABI()
    return {
      to: contract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  
  } else if(data.type === jobType.PG_DARKPOOL_CURVE_STABLESWAP){
    const validProof = await zkProofVerifier(web3,data.proof,data.verifierArgs,jobType.PG_DARKPOOL_CURVE_LP)
    if(!validProof){
        throw new RelayerError('Invalid proof')
    }
    //calldata = contract.methods.uniswap_lp(data.asset1, data.proof1,data.asset2, data.proof2, ...data.args).encodeABI()
    return {
      to: contract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if(data.type === jobType.PG_DARKPOOL_CURVE_LP){
    const validProof = await zkProofVerifier(web3,data.proof,data.verifierArgs,jobType.PG_DARKPOOL_CURVE_LP)
    if(!validProof){
        throw new RelayerError('Invalid proof')
    }
    //calldata = contract.methods.uniswap_lp(data.asset1, data.proof1,data.asset2, data.proof2, ...data.args).encodeABI()
    return {
      to: contract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else if(data.type === jobType.PG_DARKPOOL_1INCH_SWAP){
    const validProof = await zkProofVerifier(web3,data.proof,data.verifierArgs,jobType.PG_DARKPOOL_CURVE_LP)
    if(!validProof){
        throw new RelayerError('Invalid proof')
    }
    //calldata = contract.methods.uniswap_lp(data.asset1, data.proof1,data.asset2, data.proof2, ...data.args).encodeABI()
    return {
      to: contract._address,
      data: calldata,
      gasLimit: gasLimits['DEFI_WITH_EXTRA'],
    }
  } else {
      throw new RelayerError(`Unknown job type: ${data.type}`)
  }
}

async function isOutdatedTreeRevert(receipt, currentTx) {
  try {
    await web3.eth.call(currentTx.tx, receipt.blockNumber)
    console.log('Simulated call successful')
    return false
  } catch (e) {
    console.log('Decoded revert reason:', e.message)
    return (
      e.message.indexOf('Outdated account merkle root') !== -1 ||
      e.message.indexOf('Outdated tree update merkle root') !== -1
    )
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
    console.error('processJob', e.message,e.stack)
    await updateStatus(status.FAILED)
    throw new RelayerError(e.message)
  }
}

async function submitTx(job, retry = 0) { 
  await checkPgFee(job.data.asset, job.data.amount, job.data.fee, job.data.refund)

  currentTx = await txManager.createTx(await getTxObject(job))

  /*if (job.data.type !== jobType.PORTALGATE_WITHDRAW) {
    await fetchTree()
  }*/

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
      /*if (job.data.type !== jobType.PORTALGATE_WITHDRAW && (await isOutdatedTreeRevert(receipt, currentTx))) {
        if (retry < 3) {
          await updateStatus(status.RESUBMITTED)
          await submitTx(job, retry + 1)
        } else {
          throw new RelayerError('Tree update retry limit exceeded')
        }
      } else {*/
      throw new RelayerError('Submitted transaction failed')
      //}
    }
  } catch (e) {
    // todo this could result in duplicated error logs
    // todo handle a case where account tree is still not up to date (wait and retry)?
    /*if (
      job.data.type !== jobType.PORTALGATE_WITHDRAW &&
      (e.message.indexOf('Outdated account merkle root') !== -1 ||
        e.message.indexOf('Outdated tree update merkle root') !== -1)
    ) {
      if (retry < 5) {
        await sleep(3000)
        console.log('Tree is still not up to date, resubmitting')
        await submitTx(job, retry + 1)
      } else {
        throw new RelayerError('Tree update retry limit exceeded')
      }
    } else {*/
    throw new RelayerError(`Revert by smart contract ${e.message}`)
    //}
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
