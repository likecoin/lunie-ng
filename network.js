export default {
  id: 'likecoin-mainnet-2',
  name: 'LikeCoin',
  description:
    'LikeCoin is a decentralized publishing infrastructure. It provides a comprehensive metadata framework to facilitate content registration, licensing, and monetization for all media types.',
  logo: `logo.svg`,
  website: 'https://like.co',
  siteURL: 'https://dao.like.co',
  apiURL: 'https://mainnet-node.like.co',
  rpcURL: 'https://mainnet-node.like.co/rpc/',
  stakingWalletURL: 'https://dao.like.co',
  authcoreURL: 'https://authcore.like.co',
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
  icon: `https://like.co/logo.png`,

  // This is only to be used as a developer tool and for testing purposes
  // NEVER ENABLE LOCALSIGNING IN PRODUCTION OR FOR MAINNETS
  localSigning: false,
  isChainUpgrading: false,
}
