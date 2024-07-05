const { ChainId } = require('./constants')

const stakingTokenConfig = {
  [ChainId.MAINNET]: [
    {
      originalToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      stakingToken: '0x1Df4fAe6CC88A19825dA7dCF8Fcac8E44BA14D2C',
      name: 'sgETH',
    },
    {
      originalToken: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
      stakingToken: '0xe397804A9Ff78329997A2b07aF91D484f78e77Be',
      name: 'sgSTETH',
    },
    {
      originalToken: '0xae78736cd615f374d3085123a210448e74fc6393',
      stakingToken: '0xA8B78eFF928c30e43A60d8920d1549177652045d',
      name: 'sgRETH',
    },
    {
      originalToken: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      stakingToken: '0x91605474f1774f3C1401291A265fa8A995effeb2',
      name: 'sgUSDT',
    },
    {
      originalToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      stakingToken: '0x0692623f022a622b9CB33ffBEe6c14c8abebf4cc',
      name: 'sgUSDC',
    },
  ],
  [ChainId.ARBITRUM_ONE]: [
    {
      originalToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      stakingToken: '0xB2393C436a29edc40BA90b9944edB84466565E0c',
      name: 'sgETH',
    },
    {
      originalToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      stakingToken: '0xAB5a3Ab2ef9a03de376CAce74c901a0fccD2A06d',
      name: 'sgUSDT',
    },
    {
      originalToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      stakingToken: '0xFB6C93eF0B515d041b0DcDF427657E41DDDB8Da8',
      name: 'sgUSDC',
    },
  ],
  [ChainId.POLYGON]: [],
  [ChainId.SEPOLIA]: [],
  [ChainId.BounceBitTestnet]: [
    {
      originalToken: '0x0000000000000000000000000000000000000000',
      stakingToken: '0x1276801901cBC847077a8e7e27C973894c86157A',
      name: 'sgBB',
    },
  ],
  [ChainId.HARDHAT]: [
    {
      originalToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      stakingToken: '0x30A6d2B697635a0ECf1975d2386A0FE6b608B0Fb',
      name: 'sgETH',
    },
    {
      originalToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      stakingToken: '0xCd9BC6cE45194398d12e27e1333D5e1d783104dD',
      name: 'sgUSDC',
    },
  ],
  [ChainId.HARDHAT_ARBITRUM]: [],
  [ChainId.HARDHAT_POLYGON]: [],
}



module.exports = {
  stakingTokenConfig
}