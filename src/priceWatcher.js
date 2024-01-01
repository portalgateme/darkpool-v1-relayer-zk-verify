const { offchainOracleAddress } = require('./config')
const {
  getArgsForOracle,
  setSafeInterval,
  getRateToEth,
  toBN,
  RelayerError,
  logRelayerError,
} = require('./utils')
const { redis } = require('./modules/redis')
const { tokenAddresses, oneUintAmount, currencyLookup } = getArgsForOracle()

async function main() {
  try {
    const ethRates = {}
    for (let i = 0; i < tokenAddresses.length; i++) {
      try {
        const rateFormatted = getRateToEth(tokenAddresses[i],true)
        ethRates[currencyLookup[tokenAddresses[i]]] = rateFormatted.toString()
      } catch (e) {
        console.error('cant get price of ', tokenAddresses[i])
      }
    }
    if (!Object.values(ethRates).length) {
      throw new RelayerError('Can`t update prices', 1)
    }
    await redis.hmset('rates', ethRates)
    console.log('Wrote following prices to redis', ethPrices)
  } catch (e) {
    await logRelayerError(redis, e)
    console.error('priceWatcher error', e)
  }
}

setSafeInterval(main, 30 * 1000)
