const { controller, status } = require('./contollers')
const router = require('express').Router()

// Add CORS headers
router.use((req, res, next) => {
  res.header('X-Frame-Options', 'DENY')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Log error to console but don't send it to the client to avoid leaking data
router.use((err, req, res, next) => {
  if (err) {
    console.error(err)
    return res.sendStatus(500)
  }
  next()
})

router.get('/', status.index)
router.get('/status', status.status)
router.get('/v1/jobs/:id', status.getJob)
router.post('/v1/pgDarkPoolWithdraw', controller.pgDarkPoolWithdraw)
router.post('/v1/pgDarkPoolUniswapSingleSwap', controller.pgDarkPoolUniswapSingleSwap)
router.post('/v1/pgDarkPoolUniswapLP', controller.pgDarkPoolUniswapLP)
router.post('/v1/pgDarkPoolUniswapCollectFees', controller.pgDarkPoolUniswapCollectFees)
router.post('/v1/pgDarkPoolUniswapRemoveLiquidity', controller.pgDarkPoolUniswapRemoveLiquidity)
router.post('/v1/pgDarkPoolCurveMultiExchange', controller.pgDarkPoolCurveMultiExchange)
router.post('/v1/pgDarkPoolCurveAddLiquidity', controller.pgDarkPoolCurveAddLiquidity)
router.post('/v1/pgDarkPoolCurveRemoveLiquidity', controller.pgDarkPoolCurveRemoveLiquidity)
router.post('/v1/pgDarkPoolZkStake', controller.pgDarkPoolZkStake)
router.post('/v1/pgDarkPoolZkRedeem', controller.pgDarkPoolZkRedeem)
router.post('/v1/pgDarkPoolRocketPoolStake', controller.pgDarkPoolRocketPoolStake)
router.post('/v1/pgDarkPoolRocketPoolUnStake', controller.pgDarkPoolRocketPoolUnStake)
router.post('/v1/pgDarkPoolSablierClaim', controller.pgDarkPoolSablierClaim)
router.post('/v1/pgDarkPoolDefiInfra', controller.pgDarkPoolDefiInfra)
router.post('/v1/pgDarkPoolAerodromeAddLiquidity', controller.pgDarkPoolAerodromeAddLiquidity)
router.post('/v1/pgDarkPoolAerodromeRemoveLiquidity', controller.pgDarkPoolAerodromeRemoveLiquidity)
router.post('/v1/pgDarkPoolAerodromeSwap', controller.pgDarkPoolAerodromeSwap)

module.exports = router
