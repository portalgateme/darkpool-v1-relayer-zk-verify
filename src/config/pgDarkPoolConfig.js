const { ChainId } = require('./constants')

module.exports = {
  [ChainId.MAINNET]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    rETHAddress: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    offchainOracleAddress: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
    verifierHub: '0x6c3Fac202241F3c6B19EBCa043091E3aab21F3F2',
    curveAddLiquidityAssetManager: '0xEBeD6c7C2189bf8ad6687D3A4cf4b83fB4D1a3D2',
    curveFSNAddLiquidityAssetManager: '0x43fbE6066886F7b89EA6091f6cea8E3AD0FA7C71',
    curveFSNRemoveLiquidityAssetManager: '0xfdA33b941E6C014bD079C6917b815EFA58976f37',
    curveMPAddLiquidityAssetManager: '0x84eb120A35802460484015e6748375369e40468a',
    curveMPRemoveLiquidityAssetManager: '0xC4e979C922E93938dBaBb6e1623a19cbc6132489',
    curveMultiExchangeAssetManager: '0x3D76Fd85FCc2593970d22Aa34bcC4c5444c57c9D',
    curveRemoveLiquidityAssetManager: '0xfBf0dDceF9360757fCA368911b6719a35DD8C660',
    curveSingleExchangeAssetManager: '0xB1CC5D9227323330E8a58e891c123B38D03f0BAA',
    darkpoolAssetManager: '0x159F3668c72BBeCdF1fb31beeD606Ec9649654eB',
    uniswapLiquidityAssetManager: '0x53e5A08c95CF866E34F2A6A685ee9f90366e154E',
    uniswapSwapAssetManager: '0xc98b275a309f187b691e025b956e03603e12b420',
    rocketPoolStakeAssetManager: '0xEF8F70bB29DEAd5CEcaE26C6Cb19B987475B3e48',
    sablierDynamicAssetManager: '0x0',
    sablierLinearAssetManager: '0x0',
    stakingOperator: '0x539bcbc08F2cA42E50887dA4Db0DC34EbF0B090b',
    stakingAssetManager: '0x1Fa7Cb4925086128f3bb9e26761C9C75dbAC3CD1',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',
    //deployedBlock: 18323404,
    uniswapNfpManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    sablierV2LockupLinear: '0xAFb979d9afAd1aD27C5eFf4E27226E3AB9e5dCC9',
    sablierV2LockupDynamic: '0x7CC7e125d83A581ff438608490Cc0f7bDff79127',
  },
  [ChainId.ARBITRUM_ONE]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    offchainOracleAddress: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
    verifierHub: '0x630aD89523a18fA30F752297F3F53B7BC363488b',
    // curve doesn't support arbitrum
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    darkpoolAssetManager: '0xf7C40b5057a1D1a3d58B02BCdb125E63ef380564',
    uniswapLiquidityAssetManager: '0x9D4746F8f2364da04fF47d729072F71b742726aA',
    uniswapSwapAssetManager: '0xdB9ea6e600077492Ef568826AC9155159D7Da8C9',
    rocketPoolStakeAssetManager: '0x0',// rocket pool doesn't support arbitrum
    sablierDynamicAssetManager: '0x0',
    sablierLinearAssetManager: '0x0',
    stakingOperator: '0xF4f1D4F28Be82D81135c13D255452B8325B585B0',
    stakingAssetManager: '0xB1CC5D9227323330E8a58e891c123B38D03f0BAA',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',

    uniswapNfpManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    sablierV2LockupLinear: '0xFDD9d122B451F549f48c4942c6fa6646D849e8C1',
    sablierV2LockupDynamic: '0xf390cE6f54e4dc7C5A5f7f8689062b7591F7111d',
  },
  [ChainId.BounceBit]: {
    nativeToken: '0x0000000000000000000000000000000000000000',
    offchainOracleAddress: '0x0000000000000000000000000000000000000000',
    verifierHub: '0x4F526939E5e5EC49dADb8707f44DDD97543B6cBa',
    // curve doesn't support bb
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    stakingOperator: '0x4d459dDe25707CA353De15CC3B85b7C2e4bb380c',
    darkpoolAssetManager: '0x722133fBb559E2849e3402De3279Bd3059b7fe4E',
    nftAssetManager: '0x0f3778d690090E6dfd0fc5948b23A55A587C558E',
    oTCSwapAssetManager: '0xAa5e02284d1Fd0f6C12AFBDABc28Ed5aC5a6474b',
    generalDefiIntegrationAssetManager: '0x881e3e5416D1b6acecD9d5BA20895D06Ecc40a28',
    stakingAssetManager: '0xe6B0a94e1eA206B122a11a30dA7FB9ADaA12ef42',
    uniswapLiquidityAssetManager: '0x0',
    uniswapSwapAssetManager: '0x0',
    // rocket pool doesn't support bb
    rocketPoolStakeAssetManager: '0x0',
    sablierDynamicAssetManager: '0x0',
    sablierLinearAssetManager: '0x0',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',

    uniswapNfpManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    skipDefaultPriceOrace: true,
  },
  [ChainId.BASE]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    offchainOracleAddress: '0x0FfC4A1d000F0078d14FD32D73E98227fDca35F8',
    verifierHub: '0x0',
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    darkpoolAssetManager: '0x0',
    uniswapLiquidityAssetManager: '0x0',
    uniswapSwapAssetManager: '0x0',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',


    uniswapNfpManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    uniswapFactory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    sablierV2LockupLinear: '0x4CB16D4153123A74Bc724d161050959754f378D8',
    sablierV2LockupDynamic: '0xF9E9eD67DD2Fab3b3ca024A2d66Fcf0764d36742',
  },
  [ChainId.SEPOLIA]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    rETHAddress: '0x',
    offchainOracleAddress: '0x4Fe44a9aC8Ef059Be2dB97f9e3bcA32Ab698C2f2',
    verifierHub: '0xcA64c6e94afE0e138fBcDd6f06D7a7d770A50DF8',
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    darkpoolAssetManager: '0xE79738042732E4A4b05CebCA8416e991326e4445',
    uniswapLiquidityAssetManager: '0x76685DBF155c76FBFeaaCFD1e4C9b45454480a68',
    uniswapSwapAssetManager: '0xb990Eece80430B39E6f1526E0fC69C3C9cb77Fc4',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',
    //deployedBlock: 9739503,
    uniswapNfpManager: '0x1238536071E1c677A632429e3655c799b22cDA52',
    uniswapFactory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    sablierV2LockupLinear: '0x7a43F8a888fa15e68C103E18b0439Eb1e98E4301',
    sablierV2LockupDynamic: '0xc9940AD8F43aAD8e8f33A4D5dbBf0a8F7FF4429A',
  },
  [ChainId.BounceBitTestnet]: {
    nativeToken: '0x0000000000000000000000000000000000000000',
    rETHAddress: '0x',
    offchainOracleAddress: '0x0000000000000000000000000000000000000000',
    stakingOperator: '0xEF8F70bB29DEAd5CEcaE26C6Cb19B987475B3e48',
    verifierHub: '0x539bcbc08F2cA42E50887dA4Db0DC34EbF0B090b',
    darkpoolAssetManager: '0xf21f124F395271e8435A93063AE2AD74829D7b69',
    nftAssetManager: '0x2E6Dc65E715C6ce7154194918dF830cbfd706EF4',
    oTCSwapAssetManager: '0xe7b3a2144e936fb1Ff2f183b8C25D4171Df86F91',
    generalDefiIntegrationAssetManager: '0x1Df4fAe6CC88A19825dA7dCF8Fcac8E44BA14D2C',
    stakingAssetManager: '0x30cAA40e8D8d00fEAFc05732Ed75856f5eC7F89c',
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    rocketPoolStakeAssetManager: '0x0',
    sablierDynamicAssetManager: '0x0',
    sablierLinearAssetManager: '0x0',
    uniswapLiquidityAssetManager: '0x0',
    uniswapSwapAssetManager: '0x0',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',
    //deployedBlock: 9739503,
    uniswapNfpManager: '0x1238536071E1c677A632429e3655c799b22cDA52',
    uniswapFactory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  },
  [ChainId.HARDHAT]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    rETHAddress: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    offchainOracleAddress: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
    stakingOperator: '0x6B9C4119796C80Ced5a3884027985Fd31830555b',
    verifierHub: '0xA8d14b3d9e2589CEA8644BB0f67EB90d21079f8B',
    darkpoolAssetManager: '0xe24e7570Fe7207AdAaAa8c6c89a59850391B5276',
    nftAssetManager: '0xe519389F8c262d4301Fd2830196FB7D0021daf59',
    curveAddLiquidityAssetManager: '0x49AeF2C4005Bf572665b09014A563B5b9E46Df21',
    curveFSNAddLiquidityAssetManager: '0xD61210E756f7D71Cc4F74abF0747D65Ea9d7525b',
    curveFSNRemoveLiquidityAssetManager: '0xB8d6D6b01bFe81784BE46e5771eF017Fa3c906d8',
    curveMPAddLiquidityAssetManager: '0x81f4f47aa3bBd154171C877b4d70F6C9EeCAb216',
    curveMPRemoveLiquidityAssetManager: '0x0C8542AB89c1C60D711B00F309f7EF63b5D9d6eb',
    curveMultiExchangeAssetManager: '0xB354ECF032e9e14442bE590D9Eaee37d2924B67A',
    curveRemoveLiquidityAssetManager: '0x221416CFa5A3CD92035E537ded1dD12d4d587c03',
    curveSingleExchangeAssetManager: '0x81F82957608f74441E085851cA5Cc091b23d17A2',
    generalDefiIntegrationAssetManager: '0xE0a1556ef66873d965A2F4caD06F051646BE6707',
    rocketPoolStakeAssetManager: '0x1c32f8818e38a50d37d1E98c72B9516a50985227',
    sablierDynamicAssetManager: '0x71d2EBF08bF4FcB82dB5ddE46677263F4c534ef3',
    sablierLinearAssetManager: '0xd2983525E903Ef198d5dD0777712EB66680463bc',
    stakingAssetManager: '0x72aC6A36de2f72BD39e9c782e9db0DCc41FEbfe2',
    uniswapLiquidityAssetManager: '0xCd9BC6cE45194398d12e27e1333D5e1d783104dD',
    uniswapSwapAssetManager: '0xfaA7b3a4b5c3f54a934a2e33D34C7bC099f96CCE',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',

    uniswapNfpManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    sablierV2LockupLinear: '0xAFb979d9afAd1aD27C5eFf4E27226E3AB9e5dCC9',
    sablierV2LockupDynamic: '0x7CC7e125d83A581ff438608490Cc0f7bDff79127',
  },
  [ChainId.HARDHAT_ARBITRUM]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    offchainOracleAddress: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
    verifierHub: '0x868542bE225690DCfE753e2e8977E3500677e749',
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    darkpoolAssetManager: '0x920D80F5490c073A46076a61897A6e6dc88Bbf0D',
    uniswapLiquidityAssetManager: '0xF4844d9CD10c9f68e626310579996F7539A7c4F3',
    uniswapSwapAssetManager: '0xc538D528a9eE0A8137C99a15d1DE873e902C1115',
    stakingAssetManager: '0x0',
    aerodromeAddLiquidityAssetManager: '0x0',
    aerodromeRemoveLiquidityAssetManager: '0x0',
    aerodromeSwapAssetManager: '0x0',

    uniswapNfpManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    sablierV2LockupLinear: '0xFDD9d122B451F549f48c4942c6fa6646D849e8C1',
    sablierV2LockupDynamic: '0xf390cE6f54e4dc7C5A5f7f8689062b7591F7111d',
  },
  [ChainId.HARDHAT_BASE]: {
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    offchainOracleAddress: '0xf224a25453D76A41c4427DD1C05369BC9f498444',
    curveAddLiquidityAssetManager: '0x0',
    curveFSNAddLiquidityAssetManager: '0x0',
    curveFSNRemoveLiquidityAssetManager: '0x0',
    curveMPAddLiquidityAssetManager: '0x0',
    curveMPRemoveLiquidityAssetManager: '0x0',
    curveMultiExchangeAssetManager: '0x0',
    curveRemoveLiquidityAssetManager: '0x0',
    curveSingleExchangeAssetManager: '0x0',
    stakingOperator: '0x5D42EBdBBa61412295D7b0302d6F50aC449Ddb4F',
    verifierHub: '0xddE78e6202518FF4936b5302cC2891ec180E8bFf',
    darkpoolAssetManager: '0x045857BDEAE7C1c7252d611eB24eB55564198b4C',
    nftAssetManager: '0x1780bCf4103D3F501463AD3414c7f4b654bb7aFd',
    oTCSwapAssetManager: '0xeF31027350Be2c7439C1b0BE022d49421488b72C',
    aerodromeAddLiquidityAssetManager: '0xdFdE6B33f13de2CA1A75A6F7169f50541B14f75b',
    aerodromeRemoveLiquidityAssetManager: '0xd9140951d8aE6E5F625a02F5908535e16e3af964',
    aerodromeSwapAssetManager: '0xe70f935c32dA4dB13e7876795f1e175465e6458e',
    generalDefiIntegrationAssetManager: '0x56fC17a65ccFEC6B7ad0aDe9BD9416CB365B9BE8',
    sablierDynamicAssetManager: '0xAdE429ba898c34722e722415D722A70a297cE3a2',
    sablierLinearAssetManager: '0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89',
    stakingAssetManager: '0xDde063eBe8E85D666AD99f731B4Dbf8C98F29708',
    uniswapLiquidityAssetManager: '0x162700d1613DfEC978032A909DE02643bC55df1A',
    uniswapSwapAssetManager: '0x8bEe2037448F096900Fd9affc427d38aE6CC0350',

    uniswapNfpManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    uniswapFactory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    sablierV2LockupLinear: '0x4CB16D4153123A74Bc724d161050959754f378D8',
    sablierV2LockupDynamic: '0xF9E9eD67DD2Fab3b3ca024A2d66Fcf0764d36742',
  }
}