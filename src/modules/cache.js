const { redis, redisUrl } = require('./redis')



async function setDecimal(address, decimal){
    try{
        await redis.set(`decimal:${address}`, decimal)
    } catch(error){
        console.error(error)
    }
}

async function getDecimal(address) {
    try{
        return await redis.get(`decimal:${address}`)
    } catch(error){
        return null
    }
}

module.exports = {
    setDecimal,
    getDecimal
}