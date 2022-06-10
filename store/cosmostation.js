import network from '~/common/network'

export const state = () => ({
  accounts: [],
  initialized: false,
  error: undefined,
  loading: false,
})

export const mutations = {
  setAccounts(state, accounts) {
    state.accounts = accounts
  },
  setInitialized(state) {
    state.initialized = true
  },
  setError(state, error) {
    state.error = error
  },
  setLoading(state, loading) {
    state.loading = loading
  },
}

export const actions = {
  async init({ commit, dispatch }, trys = 0) {
    commit('setError', undefined)
    commit('setLoading', true)

    // sometimes the page loads quicker the cosmostation is available
    // so we try again for a couple of times but give up at somepoint
    if (!window.cosmostation && trys < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      dispatch('init', trys + 1)
    }
    if (window.cosmostation) {
      const block = await dispatch('data/getBlock', undefined, { root: true })
      try {
        const supportedChains = await window.cosmostation.tendermint.request({
          method: 'ten_supportedChainNames',
        })
        if (
          !Object.values(supportedChains).find((l) =>
            l.find((c) => c.toLowerCase() === network.name.toLowerCase())
          )
        ) {
          await window.cosmostation.tendermint.request({
            method: 'ten_addChain',
            params: {
              chainId: block.chainId,
              chainName: network.name,
              addressPrefix: network.addressPrefix,
              baseDenom: network.coinLookup[0].chainDenom,
              displayDenom: network.coinLookup[0].viewDenom,
              restURL: network.apiURL,
              coinType: '118', // optional (default: '118')
              decimals: network.coinLookup[0].chainToViewConversionFactor
                .toString()
                .split('.')[1].length,
              gasRate: {
                // optional (default: { average: '0.025', low: '0.0025', tiny: '0.00025' })
                average: '1000',
                low: '10',
                tiny: '1',
              },
              sendGas: network.fees.default.gasEstimate.toString(),
            },
          })
        }
        let account
        try {
          account = await window.cosmostation.tendermint.request({
            method: 'ten_account',
            params: { chainName: network.name },
          })
        } catch (err) {
          console.error(err)
        }
        if (!account) {
          account = await window.cosmostation.tendermint.request({
            method: 'ten_requestAccount',
            params: { chainName: network.name },
          })
        }
        commit('setAccounts', [account])

        commit('setInitialized')
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        return
      }
    }

    commit('setLoading', false)
  },
  getSigner() {
    return {
      sign: async (_, doc) => {
        const {
          signed_doc: signed,
          signature,
          pub_key: pubKey,
        } = await window.cosmostation.tendermint.request({
          method: 'ten_signAmino',
          params: {
            chainName: network.name,
            doc,
            isEditMemo: true,
            isEditFee: true,
          },
        })
        return { signed, signature: { signature, pub_key: pubKey } }
      },
    }
  },
}
