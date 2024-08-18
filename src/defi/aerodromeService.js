const { netId } = require('../config/config')

const routerAbi = require('../../abis/aerodrome/Router.json')
const poolAbi = require('../../abis/aerodrome/Pool.json')
const aerodromeConfig = require('../config/aerodromeConfig')

async function getFactory(
    web3,
    pool
) {
    const contract = new web3.eth.Contract(poolAbi, pool)
    return await contract.methods.factory().call()
}

async function estimateWithdraw(
    web3,
    pool,
    outAsset1,
    outAsset2,
    isStable,
    amountBurn
) {
    const factory = await getFactory(web3, pool)
    const contract = new web3.eth.Contract(routerAbi, aerodromeConfig[netId].router)
    const result = await contract.methods.quoteRemoveLiquidity(
        outAsset1,
        outAsset2,
        isStable,
        factory,
        amountBurn
    ).call()

    const outAmount1 = BigInt(result[0])
    const outAmount2 = BigInt(result[1])

    return {
        outAmount1,
        outAmount2
    }
}


module.exports = {
    estimateWithdraw
}