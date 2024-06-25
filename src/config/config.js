require('dotenv').config()

const { jobType } = require('./constants')
const pgConfig = require('./pgDarkPoolConfig')
const { gasLimitConfig } = require('./gasConfig')

const netId = Number(process.env.NET_ID) || 1

module.exports = {
  netId,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  httpRpcUrl: process.env.HTTP_RPC_URL,
  oracleRpcUrl: process.env.ORACLE_RPC_URL || 'https://mainnet.infura.io/',
  nativeToken: pgConfig[`netId${netId}`].nativeToken,
  offchainOracleAddress: pgConfig[`netId${netId}`].offchainOracleAddress,
  pgDarkPoolAssetManager: pgConfig[`netId${netId}`].darkpoolAssetManager,
  pgDarkPoolUniswapSwapAssetManager: pgConfig[`netId${netId}`].uniswapSwapAssetManager,
  pgDarkPoolUniswapLiquidityAssetManager: pgConfig[`netId${netId}`].uniswapLiquidityAssetManager,
  pgDarkPoolCurveMultiExchangeAssetManager: pgConfig[`netId${netId}`].curveMultiExchangeAssetManager,
  pgDarkPoolCurveAddLiquidityAssetManager: pgConfig[`netId${netId}`].curveAddLiquidityAssetManager,
  pgDarkPoolCurveRemoveLiquidityAssetManager: pgConfig[`netId${netId}`].curveRemoveLiquidityAssetManager,
  pgDarkPoolCurveFSNAddLiquidityAssetManager: pgConfig[`netId${netId}`].curveFSNAddLiquidityAssetManager,
  pgDarkPoolCurveFSNRemoveLiquidityAssetManager: pgConfig[`netId${netId}`].curveFSNRemoveLiquidityAssetManager,
  pgDarkPoolCurveMPAddLiquidityAssetManager: pgConfig[`netId${netId}`].curveMPAddLiquidityAssetManager,
  pgDarkPoolCurveMPRemoveLiquidityAssetManager: pgConfig[`netId${netId}`].curveMPRemoveLiquidityAssetManager,
  pgDarkPoolStakingAssetManager: pgConfig[`netId${netId}`].stakingAssetManager,
  pgDarkPoolStakingOperator: pgConfig[`netId${netId}`].stakingOperator,
  pgDarkPoolRocketPoolStakeAssetManager: pgConfig[`netId${netId}`].rocketPoolStakeAssetManager,
  uniswapNfpManager: pgConfig[`netId${netId}`].uniswapNfpManager,
  uniswapFactory: pgConfig[`netId${netId}`].uniswapFactory,

  

  pgDarkPoolVerifierHub: pgConfig[`netId${netId}`].verifierHub,
  privateKey: process.env.PRIVATE_KEY,
  port: process.env.APP_PORT || 8000,
  pgServiceFee: Number(process.env.REGULAR_PG_DARKPOOL_SERVICE_FEE),
  rewardAccount: process.env.REWARD_ACCOUNT,
  gasLimits: gasLimitConfig[netId],
  gasUnitFallback: {
    [jobType.PG_DARKPOOL_WITHDRAW]:                 800000,
    [jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP]:       2000000,
    [jobType.PG_DARKPOOL_UNISWAP_LP]:               4800000,
    [jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING]:   2800000,
    [jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY]: 3000000,
    [jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE]:     2200000,
    [jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY]:      5000000,
    [jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY]:   4300000,
  },
  minimumBalance: '500000000000000000',
  baseFeeReserve: Number(process.env.BASE_FEE_RESERVE_PERCENTAGE),
}