const jobType = Object.freeze({
    PG_DARKPOOL_WITHDRAW: 'PG_DARKPOOL_WITHDRAW',
    PG_DARKPOOL_UNISWAP_SINGLESWAP: 'PG_DARKPOOL_UNISWAP_SINGLESWAP',
    PG_DARKPOOL_UNISWAP_LP: 'PG_DARKPOOL_UNISWAP_LP',
    PG_DARKPOOL_CURVE_STABLESWAP: 'PG_DARKPOOL_CURVE_STABLESWAP',
    PG_DARKPOOL_CURVE_LP: 'PG_DARKPOOL_CURVE_LP',
    PG_DARKPOOL_1INCH_SWAP: 'PG_DARKPOOL_1INCH_SWAP',
    //PG_DARKPOOL_UNISWAP_MULTIHOPSWAP: 'PG_DARKPOOL_UNISWAP_MULTIHOPSWAP',
    //MINING_REWARD: 'MINING_REWARD',
    //MINING_WITHDRAW: 'MINING_WITHDRAW',
  })
  
  const status = Object.freeze({
    QUEUED: 'QUEUED',
    ACCEPTED: 'ACCEPTED',
    SENT: 'SENT',
    MINED: 'MINED',
    RESUBMITTED: 'RESUBMITTED',
    CONFIRMED: 'CONFIRMED',
    FAILED: 'FAILED',
  })
  
  module.exports = {
    jobType,
    status,
  }  