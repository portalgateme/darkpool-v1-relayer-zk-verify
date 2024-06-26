//const { poseidon } = require('circomlib')
const { toBN, toChecksumAddress, BN, fromWei, isAddress, toWei, toBigInt } = require('web3-utils')
const { offchainOracleAddress } = require('./config/config')
const web3 = require('./modules/web3')('oracle')
const offchainOracleABI = require('../abis/OffchainOracle.abi.json')
const offchainOracle = new web3.eth.Contract(offchainOracleABI, offchainOracleAddress)
const sleep = ms => new Promise(res => setTimeout(res, ms))
const erc20ABI = require('../abis/erc20Simple.abi.json')
const { getDecimal, setDecimal } = require('./modules/cache')

async function getDecimalByAddress(web3, address) {
  const decimal = await getDecimal(address)
  if (decimal) {
    return decimal
  } else {
    const contract = new web3.eth.Contract(erc20ABI, address)
    const decimals = await contract.methods.decimals().call()
    await setDecimal(address, decimals)
    return decimals
  }
}

function isETH(address) {
  return address.toLowerCase() == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
}

//const poseidonHash = items => toBN(poseidon(items).toString())
//const poseidonHash2 = (a, b) => poseidonHash([a, b])

function setSafeInterval(func, interval) {
  func()
    .catch(console.error)
    .finally(() => {
      setTimeout(() => setSafeInterval(func, interval), interval)
    })
}

/**
 * A promise that resolves when the source emits specified event
 */
function when(source, event) {
  return new Promise((resolve, reject) => {
    source
      .once(event, payload => {
        resolve(payload)
      })
      .on('error', error => {
        reject(error)
      })
  })
}

function getArgsForOracle() {
  const tokens = {
    'usdc': {
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6
    },
    'usdt': {
      tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6
    },
    'DAI': {
      tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18
    },
    'WBTC': {
      tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8
    }
  }
  const tokenAddresses = []
  const oneUintAmount = []
  const currencyLookup = {}
  Object.entries(tokens).map(([currency, data]) => {
    if (currency !== 'eth') {
      tokenAddresses.push(data.tokenAddress)
      oneUintAmount.push(toBN('10').pow(toBN(data.decimals.toString())).toString())
      currencyLookup[data.tokenAddress] = currency
    }
  })
  return { tokenAddresses, oneUintAmount, currencyLookup }
}

async function getRateToEth(srcToken, useSrcWrappers) {

  try {
    const rate = await offchainOracle.methods.getRateToEth(srcToken, useSrcWrappers).call()
    return toBN(rate)
  } catch (e) {
    throw new RelayerError("Can't get prices of " + srcToken, 1)
  }
}

function fromDecimals(value, decimals) {
  value = value.toString()
  let ether = value.toString()
  const base = new BN('10').pow(new BN(decimals))
  const baseLength = base.toString(10).length - 1 || 1

  const negative = ether.substring(0, 1) === '-'
  if (negative) {
    ether = ether.substring(1)
  }

  if (ether === '.') {
    throw new Error('[ethjs-unit] while converting number ' + value + ' to wei, invalid value')
  }

  // Split it into a whole and fractional part
  const comps = ether.split('.')
  if (comps.length > 2) {
    throw new Error('[ethjs-unit] while converting number ' + value + ' to wei,  too many decimal points')
  }

  let whole = comps[0]
  let fraction = comps[1]

  if (!whole) {
    whole = '0'
  }
  if (!fraction) {
    fraction = '0'
  }
  if (fraction.length > baseLength) {
    throw new Error('[ethjs-unit] while converting number ' + value + ' to wei, too many decimal places')
  }

  while (fraction.length < baseLength) {
    fraction += '0'
  }

  whole = new BN(whole)
  fraction = new BN(fraction)
  let wei = whole.mul(base).add(fraction)

  if (negative) {
    wei = wei.mul(negative)
  }

  return new BN(wei.toString(10), 10)
}

class RelayerError extends Error {
  constructor(message, score = 0) {
    super(message)
    this.score = score
  }
}

const logRelayerError = async (redis, e) => {
  await redis.zadd('errors', 'INCR', e.score || 1, e.message)
}

const readRelayerErrors = async redis => {
  const set = await redis.zrevrange('errors', 0, -1, 'WITHSCORES')
  const errors = []
  while (set.length) {
    const [message, score] = set.splice(0, 2)
    errors.push({ message, score })
  }
  return errors
}

module.exports = {
  isETH,
  setSafeInterval,
  //poseidonHash2,
  sleep,
  when,
  getArgsForOracle,
  fromDecimals,
  toBN,
  toChecksumAddress,
  fromWei,
  toWei,
  BN,
  toBigInt,
  isAddress,
  RelayerError,
  logRelayerError,
  readRelayerErrors,
  getRateToEth,
  getDecimalByAddress
}
