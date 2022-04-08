export default {
  id: 'likecoin-v2-dev-chain',
  name: 'LikeCoin v2 test chain',
  description:
    'LikeCoin is a decentralized publishing infrastructure. It provides a comprehensive metadata framework to facilitate content registration, licensing, and monetization for all media types.',
  logo: `logo.svg`,
  website: 'https://rinkeby.like.co',
  siteURL: 'https://likecoin-v2-dev-chain.netlify.app',
  apiURL: 'https://node.v2-dev.like.co',
  rpcURL: 'https://node.v2-dev.like.co/rpc/',
  authcoreURL: 'https://likecoin-integration-test.authcore.io',
  stakingWalletURL: 'https://likecoin-v2-dev-chain.netlify.app',
  minBlockHeight: 1,
  stakingDenom: 'LIKE',
  coinLookup: [
    {
      viewDenom: 'LIKE',
      chainDenom: 'nanolike',
      chainToViewConversionFactor: '0.000000001',
      icon: `currencies/like.png`,
      coinGeckoId: 'likecoin',
    },
  ],
  addressPrefix: 'like',
  validatorAddressPrefix: 'likevaloper',
  validatorConsensusaddressPrefix: 'likevalcons',
  HDPath: `m/44'/118'/0'/0/0`,
  lockUpPeriod: `21 days`,
  fees: {
    default: {
      gasEstimate: 350000,
      feeOptions: [
        {
          denom: 'LIKE',
          amount: 0.035,
        },
      ],
    },
    ClaimRewardsTx: {
      gasEstimate: 140000,
      feeOptions: [
        {
          denom: 'LIKE',
          amount: 0.014,
        },
      ],
    },
  },
  icon: `https://rinkeby.like.co/logo.png`,

  // This is only to be used as a developer tool and for testing purposes
  // NEVER ENABLE LOCALSIGNING IN PRODUCTION OR FOR MAINNETS
  localSigning: false,
}
