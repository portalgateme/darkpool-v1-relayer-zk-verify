require('dotenv').config()

const { jobType } = require('./constants')
const pgConfig = require('./config/pgDarkPoolConfig')

const netId = Number(process.env.NET_ID) || 1

module.exports = {
  netId,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  httpRpcUrl: process.env.HTTP_RPC_URL,
  oracleRpcUrl: process.env.ORACLE_RPC_URL || 'https://mainnet.infura.io/',
  offchainOracleAddress: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb',
  //pgRouterAddress: pgConfig[`netId${netId}`].pgRouter,
  pgFUZKAddress: pgConfig[`netId${netId}`].pgFUZK,
  //minerAddress: pgConfig[`netId${netId}`].miner,
  //minerMerkleTreeHeight: 20,
  privateKey: process.env.PRIVATE_KEY,
  //instances: pgConfig[`netId${netId}`].instances,
  //deployedBlock: pgConfig[`netId${netId}`].deployedBlock,
  port: process.env.APP_PORT || 8000,
  pgServiceFee: Number(process.env.REGULAR_PG_DARKPOOL_WITHDRAW_FEE),
  rewardAccount: process.env.REWARD_ACCOUNT,
  gasLimits: {
    WITHDRAW_WITH_EXTRA: 1300000,
    //[jobType.PORTALGATE_WITHDRAW]: 390000,
    //[jobType.MINING_REWARD]: 455000,
    //[jobType.MINING_WITHDRAW]: 400000,
    [jobType.PG_DARKPOOL_WITHDRAW]: 390000,
  },
  minimumBalance: '500000000000000000',
  baseFeeReserve: Number(process.env.BASE_FEE_RESERVE_PERCENTAGE),
}
