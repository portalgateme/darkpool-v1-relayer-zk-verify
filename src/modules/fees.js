const { RelayerError, toBN, toWei, isETH, getRateToEth } = require('../utils')
const { pgServiceFee } = require('../config/config')
const { getPriceToNativeFromLLama } = require('./priceOracle')
const { GasPriceOracle } = require('gas-price-oracle')
const { oracleRpcUrl } = require('../config/config')
const config = require('../config/config')
const priceWeb3 = require('./web3')('oracle')

const NATIVE_DECIMAL = 18
const PRECISION = 1000000
const GAS_PRECISION = 10
const GAS_UNIT_BUFF = 1
const GAS_PRIORITY_BUFF = 2
const MAX_PRIORITY_FEE_PRECISION = 10 ** 9

const gasPriceOracle = new GasPriceOracle({ defaultRpc: oracleRpcUrl })

async function getGasPrice(web3) {
    const block = await priceWeb3.eth.getBlock('latest')
    if (block && block.baseFeePerGas) {
        const maxPriorityFee = config.maxPriorityFee * MAX_PRIORITY_FEE_PRECISION
        console.log("=====baseFeePerGas,maxPriorityFee:", block.baseFeePerGas, maxPriorityFee);
        return toBN(block.baseFeePerGas).add(toBN(maxPriorityFee))
    }

    const { fast } = await gasPriceOracle.gasPrices()
    return toBN(toWei(fast.toString(), 'gwei'))
}

async function calcGasFee(web3, gasAmount) {
    const gasPrice = await getGasPrice(web3)
    const refinedGasPrice = gasPrice.mul(toBN(GAS_PRECISION + GAS_PRIORITY_BUFF)).div(toBN(GAS_PRECISION))
    const refinedGasAmount = toBN(gasAmount).mul(toBN(GAS_PRECISION + GAS_UNIT_BUFF)).div(toBN(GAS_PRECISION))
    const gasFee = BigInt(refinedGasPrice.mul(refinedGasAmount))
    console.log("=====gasPrice, gasAmount, gasFee :", BigInt(gasPrice), gasAmount, gasFee.toString());
    return gasFee
}

function ethToToken(ethAmount, rateToEth) {
    return ethAmount * BigInt(10 ** NATIVE_DECIMAL) / rateToEth
}

function tokenToEth(tokenAmount, rateToEth) {
    return tokenAmount * BigInt(rateToEth) / BigInt(10 ** NATIVE_DECIMAL)
}

async function rateToEth(asset) {
    const isEth = isETH(asset)
    if (isEth) {
        return BigInt(10 ** NATIVE_DECIMAL);
    } else {
        const rate = await getRateToEth(asset, true)
        return BigInt(rate.toString())
    }
}

function calcServiceFee(amount) {
    return BigInt(amount) * BigInt(pgServiceFee) / BigInt(PRECISION);
}

async function calculateFeesForOneToken(gasFeeInEth, asset, amount) {
    let rate = 0n
    if (!config.skipDefaultPriceOrace) {
        rate = await rateToEth(asset)
    }
    
    if (rate == 0n) {
        console.log("fallback to defillma for price", asset, config.skipDefaultPriceOrace)
        const prices = await getPriceToNativeFromLLama([asset]);
        rate = prices[asset];
    }

    const gasFeeInToken = ethToToken(gasFeeInEth, rate)

    const serviceFeeInToken = calcServiceFee(amount)

    return {
        gasFeeInToken,
        serviceFeeInToken,
    }
}

async function calculateFeeForTokens(gasFeeInEth, assets, amounts) {
    let tmpTotal = BigInt(0);
    let tmpRateAndAmount = [];
    let rateDict = {};
    let fallbackAssets = [];
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]
        const amount = BigInt(amounts[i])
        if (amount != 0n) {
            const rate = await rateToEth(asset);
            if (rate == 0n) {
                fallbackAssets.push(asset);
            } else {
                rateDict[asset] = rate;
            }
        }
    }

    if (fallbackAssets.length > 0) {
        const prices = await getPriceToNativeFromLLama(fallbackAssets);
        for (const asset of fallbackAssets) {
            rateDict[asset] = prices[asset];
        }
    }

    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]
        const amount = BigInt(amounts[i])
        if (amount === 0n) {
            tmpRateAndAmount.push({ rate: 0n, ethAmount: 0n, amount: 0n });
        } else {
            const rate = rateDict[asset];
            const ethAmount = tokenToEth(amount, rate);
            tmpTotal = tmpTotal + ethAmount;
            tmpRateAndAmount.push({ rate, ethAmount, amount });
        }
    }

    if (tmpTotal == BigInt(0)) {
        throw new RelayerError("Insufficient amount");
    }

    let fees = []
    for (const { rate, ethAmount, amount } of tmpRateAndAmount) {
        if (amount === 0n) {
            fees.push({
                gasFeeInToken: 0n,
                serviceFeeInToken: 0n,
            })
        } else {
            const tokenGasFeeInEth = ethAmount * gasFeeInEth / tmpTotal;
            const gasFeeInToken = ethToToken(tokenGasFeeInEth, rate);
            const serviceFeeInToken = calcServiceFee(amount)
            fees.push({
                gasFeeInToken,
                serviceFeeInToken,
            })
        }
    }

    return fees
}

module.exports = {
    calculateFeesForOneToken,
    calculateFeeForTokens,
    calcGasFee
}