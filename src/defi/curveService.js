const { RelayerError } = require('../utils')
const { netId, httpRpcUrl } = require('../config/config')

const erc20Abi = require('../../abis/erc20Simple.abi.json')
const IPoolsAbi = require('../../abis/curve/IPools.abi.json')
const { BASEPOOL_TYPE } = require('../config/constants')
const ethers = require('ethers')

const curveConfig = require('../config/curveConfig')
const withdrawLegacyAbi = require('../../abis/curve/withdrawLegacy4.abi.json')
const withdrawAbi = require('../../abis/curve/withdraw.abi.json')
const withdrawMP3PoolAbi = require('../../abis/curve/withdrawMP3Pool.abi.json')
const withdrawMPFraxUsdcAbi = require('../../abis/curve/withdrawMPFrax.abi.json')

async function estimateWithdrawAll(
    web3,
    pool,
    lpToken,
    lpTokenAmount,
    coinCount,
) {
    console.log("normal")
    const totalSupply = await getTotalSupply(web3, lpToken)

    let amounts = []
    for (let i = 0; i < coinCount; i++) {
        const balance = await getBalance(web3, pool, i)
        const amount = (BigInt(lpTokenAmount) * BigInt(balance)) / BigInt(totalSupply)
        amounts.push(amount)
    }

    return amounts
}

async function estimateWithdrawAllForMP(
    web3,
    pool,
    basePoolType,
    lpToken,
    lpTokenAmount,
    coinCount,
) {
    const amounts = await estimateWithdrawAll(web3, pool, lpToken, lpTokenAmount, 2)

    let basePool
    let baseLpToken
    if (basePoolType == BASEPOOL_TYPE.THREE_POOL) {
        console.log("mp 3pool")
        basePool = curveConfig[netId].basePool3Pool
        baseLpToken = curveConfig[netId].lpToken3Pool
    } else {
        console.log("mp frax")

        basePool = curveConfig[netId].basePoolFraxUsdc
        baseLpToken = curveConfig[netId].lpTokenFraxUsdc
    }

    const baseAmounts = await estimateWithdrawAll(web3, basePool, baseLpToken, amounts[1], coinCount - 1)

    let finalAmounts = []
    finalAmounts.push(amounts[0])
    finalAmounts = finalAmounts.concat(baseAmounts)

    return finalAmounts
}

async function getBalance(web3, pool, coinIndex) {
    const contract = new web3.eth.Contract(IPoolsAbi.abi, pool)
    try {
        return BigInt(await contract.methods.balances(BigInt(coinIndex)).call())
    } catch (error) {
        console.log('balance int')
        return BigInt(await contract.methods.balances(Number(coinIndex)).call())
    }
}


async function getTotalSupply(web3, lpToken) {
    console.log(lpToken)
    const contract = new web3.eth.Contract(erc20Abi, lpToken)
    const totalSupply = await contract.methods.totalSupply().call()
    return BigInt(totalSupply)
}

async function estimateWithdrawOneCoin(
    web3,
    pool,
    legacy,
    amountBurn,
    coinIndex,

) {
    if (legacy & 4 == 4) {
        console.log("legacy 4")
        const contract = new web3.eth.Contract(withdrawLegacyAbi, pool)
        return BigInt(await contract.methods.calc_withdraw_one_coin(amountBurn, BigInt(coinIndex)).call())
    } else {
        console.log("no legacy")
        const contract = new web3.eth.Contract(withdrawAbi, pool)
        return BigInt(await contract.methods.calc_withdraw_one_coin(amountBurn, Number(coinIndex)).call())
    }
}

async function estimateWithdrawOneCoinForMP(
    web3,
    pool,
    basePoolType,
    amountBurn,
    coinIndex,

) {
    if (basePoolType == BASEPOOL_TYPE.THREE_POOL) {
        const contract = new web3.eth.Contract(withdrawMP3PoolAbi, curveConfig[netId].zap3PoolAddress)
        return BigInt(await contract.methods.calc_withdraw_one_coin(pool, amountBurn, Number(coinIndex)).call())
    } else {
        const contract = new web3.eth.Contract(withdrawMP3PoolAbi, curveConfig[netId].zapFraxUsdcAddress)

        return BigInt(await contract.methods.calc_withdraw_one_coin(pool, amountBurn, BigInt(coinIndex)).call())
    }
}

module.exports = {
    estimateWithdrawAll,
    estimateWithdrawAllForMP,
    estimateWithdrawOneCoin,
    estimateWithdrawOneCoinForMP
}