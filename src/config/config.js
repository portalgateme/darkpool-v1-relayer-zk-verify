require('dotenv').config()

const { jobType } = require('./constants')
const pgConfig = require('./pgDarkPoolConfig')

const netId = Number(process.env.NET_ID) || 1

module.exports = {
  netId,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  httpRpcUrl: process.env.HTTP_RPC_URL,
  oracleRpcUrl: process.env.ORACLE_RPC_URL || 'https://mainnet.infura.io/',
  offchainOracleAddress: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
  pgDarkPoolAssetManager: pgConfig[`netId${netId}`].pgDarkPoolAssetManager,
  pgDarkPoolUniswapAssetManager: pgConfig[`netId${netId}`].pgDarkPoolUniswapAssetManager,
  pgDarkPoolCurveMultiExchangeAssetManager: pgConfig[`netId${netId}`].pgDarkPoolCurveMultiExchangeAssetManager,
  pgDarkPoolCurveSLPAssetManager: pgConfig[`netId${netId}`].pgDarkPoolCurveSLPAssetManager,
  pgDarkPoolCurveSPPAssetManager: pgConfig[`netId${netId}`].pgDarkPoolCurveSPPAssetManager,
  pgDarkPoolCurveCPAssetManager: pgConfig[`netId${netId}`].pgDarkPoolCurveCPAssetManager,

  pgDarkPoolVerifierHub: pgConfig[`netId${netId}`].pgDarkPoolVerifierHub,
  privateKey: process.env.PRIVATE_KEY,
  port: process.env.APP_PORT || 8000,
  pgServiceFee: Number(process.env.REGULAR_PG_DARKPOOL_SERVICE_FEE),
  rewardAccount: process.env.REWARD_ACCOUNT,
  gasLimits: {
    WITHDRAW_WITH_EXTRA: 1300000,
    DEFI_WITH_EXTRA: 8000000,
    [jobType.PG_DARKPOOL_WITHDRAW]: 390000,
    [jobType.PG_DARKPOOL_UNISWAP_SINGLESWAP]: 780000,
    [jobType.PG_DARKPOOL_UNISWAP_LP]: 780000,
    [jobType.PG_DARKPOOL_UNISWAP_FEE_COLLECTING]: 780000,
    [jobType.PG_DARKPOOL_UNISWAP_REMOVE_LIQUIDITY]: 780000,
    [jobType.PG_DARKPOOL_CURVE_MULTI_EXCHANGE]: 780000,
    [jobType.PG_DARKPOOL_CURVE_ADD_LIQUIDITY]: 780000,
    [jobType.PG_DARKPOOL_CURVE_REMOVE_LIQUIDITY]: 780000,
  },
  minimumBalance: '500000000000000000',
  baseFeeReserve: Number(process.env.BASE_FEE_RESERVE_PERCENTAGE),
}