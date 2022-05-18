export default {
  id: 'nft-dev', // DEPRECATE, only used for Lunie extension, NOT CHAIN ID
  name: 'LikeCoin NFT dev test chain',
  description:
    'LikeCoin is a decentralized publishing infrastructure. It provides a comprehensive metadata framework to facilitate content registration, licensing, and monetization for all media types.',
  logo: `logo.svg`,
  website: 'https://rinkeby.like.co',
  siteURL: 'https://likecoin-chain-nft-dev.netlify.app',
  apiURL: 'https://node.nft-dev.like.co',
  rpcURL: 'https://node.nft-dev.like.co/rpc/',
  authcoreURL: 'https://likecoin-integration-test.authcore.io',
  stakingWalletURL: 'https://likecoin-chain-nft-dev.netlify.app',
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
  allowedAddressPrefix: ['like', 'cosmos'],
  validatorAddressPrefix: 'likevaloper',
  validatorConsensusaddressPrefix: 'likevalcons', // needed to map validators from staking queries to the validator set
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
