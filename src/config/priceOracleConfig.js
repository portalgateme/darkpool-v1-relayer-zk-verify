const { ChainId } = require('./constants')


module.exports = {
    [ChainId.MAINNET]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'ethereum',
        nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        defillamaNativeDecimals : 18
    },
    [ChainId.ARBITRUM_ONE]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'arbitrum',
        nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        defillamaNativeDecimals : 18
    },
    [ChainId.BounceBit]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'bouncebit',
        defillamaNativeToken: '0x0000000000000000000000000000000000000000',
        defillamaNativeDecimals: 18
    },
    [ChainId.BASE]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'base',
        nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        defillamaNativeDecimals : 18
    },
    [ChainId.HARDHAT]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'ethereum',
        nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        defillamaNativeDecimals : 18
    },
    [ChainId.HARDHAT_ARBITRUM]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'ethereum',
        nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        defillamaNativeDecimals : 18
    },
    [ChainId.HARDHAT_BASE]: {
        defillamaUrl: 'https://coins.llama.fi',
        defillamaChainPrefix: 'base',
        nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        defillamaNativeDecimals : 18
    }
}