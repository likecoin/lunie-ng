import { AuthCoreAuthClient } from '@likecoin/authcore-js'
import {
  AuthcoreVaultClient,
  AuthcoreCosmosProvider,
} from '@likecoin/secretd-js'
import network from '~/common/network'
import { convertAddressPrefix } from '~/common/b32'

export const state = () => ({
  authClient: null,
  kvClient: null,
  cosmosProvider: null,
  accessToken: '',
  accounts: [],
  error: undefined,
  loading: false,
})

export const mutations = {
  // create set methods from data points
  ...Object.fromEntries(
    Object.keys(state()).map((entity) => {
      return [
        `set${entity.charAt(0).toUpperCase()}${entity.substr(1)}`,
        (state, value) => {
          state[entity] = value
        },
      ]
    })
  ),
}

export const actions = {
  async init({ commit, dispatch }, code) {
    commit('setError', undefined)
    commit('setLoading', true)
    commit('setAccounts', [])
    try {
      const authClient = await new AuthCoreAuthClient({
        apiBaseURL: network.authcoreURL,
      })
      commit('setAuthClient', authClient)
      const token = await authClient.createAccessToken(code)
      const { access_token: accessToken } = token
      commit('setAccessToken', accessToken)
      if (window.localStorage) {
        window.localStorage.setItem('authcore.access_token', accessToken)
      }
      await dispatch('setupCosmosProvider', accessToken)
    } catch (err) {
      commit('setLoading', false)
      commit('setError', err.message)
    }
    commit('setLoading', false)
  },
  async setupCosmosProvider({ commit }, accessToken) {
    const kvClient = await new AuthcoreVaultClient({
      apiBaseURL: network.authcoreURL,
      accessToken,
    })
    commit('setKvClient', kvClient)
    const cosmosProvider = await new AuthcoreCosmosProvider({
      client: kvClient,
    })
    commit('setCosmosProvider', cosmosProvider)
    let accounts = await cosmosProvider.getAddresses()
    accounts = accounts.map((a) =>
      convertAddressPrefix(a, network.addressPrefix)
    )
    commit('setAccounts', accounts)
    return cosmosProvider
  },
  restoreAccessToken({ commit }) {
    if (window.localStorage) {
      const accessToken = window.localStorage.getItem('authcore.access_token')
      if (accessToken) commit('setAccessToken', accessToken)
    }
  },
  clearAccessToken({ commit }) {
    if (window.localStorage) {
      window.localStorage.removeItem('authcore.access_token')
    }
    commit('setAccessToken', undefined)
  },
  async getSigner({ state, dispatch }) {
    let cosmosProvider
    if (state.cosmosProvider) cosmosProvider = state.cosmosProvider
    if (state.accessToken) {
      cosmosProvider = await dispatch('setupCosmosProvider', state.accessToken)
    }
    if (cosmosProvider) {
      return {
        sign: async (_, data) => {
          const { signatures, ...signed } = await cosmosProvider.sign(
            data,
            state.accounts[0]
          )
          return { signed, signature: signatures[0] }
        },
      }
    }
    return null
  },
}
