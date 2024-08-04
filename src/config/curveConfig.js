const { ChainId } = require('./constants')


module.exports = {
    [ChainId.MAINNET]: {
        zap3PoolAddress: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
        zapFraxUsdcAddress: '0x08780fb7E580e492c1935bEe4fA5920b94AA95Da',
        basePool3Pool: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
        basePoolFraxUsdc: '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
        lpToken3Pool: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
        lpTokenFraxUsdc: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
    },
    [ChainId.SEPOLIA]: {
        zap3PoolAddress: '',
        zapFraxUsdcAddress: '',
        basePool3Pool: '',
        basePoolFraxUsdc: '',
        lpToken3Pool: '',
        lpTokenFraxUsdc: '',
    },
    [ChainId.HARDHAT]: {
        zap3PoolAddress: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
        zapFraxUsdcAddress: '0x08780fb7E580e492c1935bEe4fA5920b94AA95Da',
        basePool3Pool: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
        basePoolFraxUsdc: '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
        lpToken3Pool: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
        lpTokenFraxUsdc: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
    },
    [ChainId.HARDHAT_ARBITRUM]: {
        zap3PoolAddress: '',
        zapFraxUsdcAddress: '',
        basePool3Pool: '',
        basePoolFraxUsdc: '',
        lpToken3Pool: '',
        lpTokenFraxUsdc: '',
    },
    [ChainId.HARDHAT_BASE]: {
        zap3PoolAddress: '',
        zapFraxUsdcAddress: '',
        basePool3Pool: '',
        basePoolFraxUsdc: '',
        lpToken3Pool: '',
        lpTokenFraxUsdc: '',
    }
}