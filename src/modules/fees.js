const { RelayerError, toBN, isETH, getRateToEth } = require('../utils')
const { pgServiceFee } = require('../config/config')

const NATIVE_DECIMAL = 18
const PRECISION = 1000000
const GAS_PRECISION = 10
const GAS_BUFF = 1

async function getGasPrice(web3) {
    const gasPrice = await web3.eth.getGasPrice()
    return toBN(gasPrice.toString())
}

async function calcGasFee(web3, gasAmount) {
    const gasPrice = await getGasPrice(web3)
    const gasFee = BigInt(gasPrice.mul(toBN(gasAmount)).toString())
    return gasFee * BigInt(GAS_PRECISION + GAS_BUFF) / BigInt(GAS_PRECISION)
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
    const rate = await rateToEth(asset)

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
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i]
        const amount = BigInt(amounts[i])
        if (amount === 0n) {
            tmpRateAndAmount.push({ rate: 0n, ethAmount: 0n, amount: 0n });
        } else {
            const rate = await rateToEth(asset);
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