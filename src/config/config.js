require('dotenv').config()

const pgConfig = require('./pgDarkPoolConfig')
const { gasLimitConfig, gasUnitFallbackConfig, maxPriorityFeeConfig, DEFAULT_MAX_PRIORITY_FEE } = require('./gasConfig')
const { stakingTokenConfig } = require('./stakingConfig')

const netId = Number(process.env.NET_ID) || 1

module.exports = {
  netId,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  httpRpcUrl: process.env.HTTP_RPC_URL,
  oracleRpcUrl: process.env.ORACLE_RPC_URL || 'https://mainnet.infura.io/',
  nativeToken: pgConfig[netId].nativeToken,
  offchainOracleAddress: pgConfig[netId].offchainOracleAddress,
  pgDarkPoolAssetManager: pgConfig[netId].darkpoolAssetManager,
  pgDarkPoolUniswapSwapAssetManager: pgConfig[netId].uniswapSwapAssetManager,
  pgDarkPoolUniswapLiquidityAssetManager: pgConfig[netId].uniswapLiquidityAssetManager,
  pgDarkPoolCurveMultiExchangeAssetManager: pgConfig[netId].curveMultiExchangeAssetManager,
  pgDarkPoolCurveAddLiquidityAssetManager: pgConfig[netId].curveAddLiquidityAssetManager,
  pgDarkPoolCurveRemoveLiquidityAssetManager: pgConfig[netId].curveRemoveLiquidityAssetManager,
  pgDarkPoolCurveFSNAddLiquidityAssetManager: pgConfig[netId].curveFSNAddLiquidityAssetManager,
  pgDarkPoolCurveFSNRemoveLiquidityAssetManager: pgConfig[netId].curveFSNRemoveLiquidityAssetManager,
  pgDarkPoolCurveMPAddLiquidityAssetManager: pgConfig[netId].curveMPAddLiquidityAssetManager,
  pgDarkPoolCurveMPRemoveLiquidityAssetManager: pgConfig[netId].curveMPRemoveLiquidityAssetManager,
  pgDarkPoolStakingAssetManager: pgConfig[netId].stakingAssetManager,
  pgDarkPoolStakingOperator: pgConfig[netId].stakingOperator,
  pgDarkPoolRocketPoolStakeAssetManager: pgConfig[netId].rocketPoolStakeAssetManager,
  pgDarkPoolSablierDynamicAssetManager: pgConfig[netId].sablierDynamicAssetManager,
  pgDarkPoolSablierLinearAssetManager: pgConfig[netId].sablierLinearAssetManager,
  pgDarkPoolGeneralDefiIntegrationAssetManager: pgConfig[netId].generalDefiIntegrationAssetManager,
  pgDarkPoolAerodromeAddLiquidityAssetManager: pgConfig[netId].aerodromeAddLiquidityAssetManager,
  pgDarkPoolAerodromeRemoveLiquidityAssetManager: pgConfig[netId].aerodromeRemoveLiquidityAssetManager,
  pgDarkPoolAerodromeSwapAssetManager: pgConfig[netId].aerodromeSwapAssetManager,

  uniswapNfpManager: pgConfig[netId].uniswapNfpManager,
  uniswapFactory: pgConfig[netId].uniswapFactory,
  sablierV2LockupLinear: pgConfig[netId].sablierV2LockupLinear,
  sablierV2LockupDynamic: pgConfig[netId].sablierV2LockupDynamic,

  pgDarkPoolVerifierHub: pgConfig[netId].verifierHub,
  privateKey: process.env.PRIVATE_KEY,
  port: process.env.APP_PORT || 8000,
  pgServiceFee: Number(process.env.REGULAR_PG_DARKPOOL_SERVICE_FEE),
  rewardAccount: process.env.REWARD_ACCOUNT,
  gasLimits: gasLimitConfig[netId],
  gasUnitFallback: gasUnitFallbackConfig[netId],
  minimumBalance: '500000000000000000',
  baseFeeReserve: Number(process.env.BASE_FEE_RESERVE_PERCENTAGE),
  stakingTokenMapping: stakingTokenConfig[netId],
  skipDefaultPriceOrace: pgConfig[netId].skipDefaultPriceOrace ? true : false,
  maxPriorityFee: maxPriorityFeeConfig[netId] ?? DEFAULT_MAX_PRIORITY_FEE,
}