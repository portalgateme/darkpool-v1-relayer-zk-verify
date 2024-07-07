const { netId } = require('../config/config')
const priceOracleConfigs = require('../config/priceOracleConfig')
const axios = require('axios')
const ethers = require('ethers')

const priceOracleConfig = priceOracleConfigs[netId]

async function getPriceToNativeFromLLama(assets) {
    let tokens = []
    const nativeToken = priceOracleConfig.defillamaChainPrefix + ":" + priceOracleConfig.nativeToken
    tokens.push(nativeToken)
    assets.forEach(asset => {
        tokens.push(priceOracleConfig.defillamaChainPrefix + ":" + asset)
    })

    const response = await axios.get(`${priceOracleConfig.defillamaUrl}/prices/current/${tokens.join(',')}?searchWidth=4h`)
    console.log(response)

    const nativeDecimal = priceOracleConfig.defillamaNativeDecimals;
    const nativePrice = ethers.utils.parseUnits(response.data['coins'][nativeToken].price.toString(), nativeDecimal);

    const prices = {}
    assets.forEach(asset => {
        const priceData = response.data['coins'][priceOracleConfig.defillamaChainPrefix + ":" + asset]
        const decimals = priceData.decimals;
        const price = ethers.utils.parseUnits(priceData.price.toString(), decimals)
        const priceToNative = ethers.BigNumber.from(price).mul(ethers.BigNumber.from(10).pow(nativeDecimal * 3 - decimals * 2)).div(ethers.BigNumber.from(nativePrice)).toBigInt()
        prices[asset] = priceToNative
    })

    return prices
}

module.exports = {
    getPriceToNativeFromLLama
}