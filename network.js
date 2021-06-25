export default {
  id: 'likecoin-chain-iscn-dev-2', // DEPRECATE, only used for Lunie extension, NOT CHAIN ID
  name: 'LikeCoin Taipei test chain',
  description:
    'LikeCoin is a decentralized publishing infrastructure. It provides a comprehensive metadata framework to facilitate content registration, licensing, and monetization for all media types.',
  logo: `logo.svg`,
  website: 'https://rinkeby.like.co',
  siteURL: 'https://likecoin-chain-iscn-dev-2.netlify.app',
  apiURL: 'https://node.iscn-dev-2.like.co', // use `npx lcp --proxyUrl http://34.123.30.100:1317`
  rpcURL: 'ws://node.iscn-dev-2.like.co:26657',
  authcoreURL: 'https://likecoin-integration-test.authcore.io',
  stakingWalletURL: 'https://likecoin-chain-iscn-dev-2.netlify.app',
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
  addressPrefix: 'cosmos',
  validatorAddressPrefix: 'cosmosvaloper',
  validatorConsensusaddressPrefix: 'cosmosvalcons', // needed to map validators from staking queries to the validator set
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
  },
  icon: `https://rinkeby.like.co/logo.png`,

  // This is only to be used as a developer tool and for testing purposes
  // NEVER ENABLE LOCALSIGNING IN PRODUCTION OR FOR MAINNETS
  localSigning: false,
}
