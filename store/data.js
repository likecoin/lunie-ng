import { keyBy, uniqBy } from 'lodash'
import network from '~/common/network'
import networkConfig from '~/network'
// import DataSource from '~/apis/cosmos-source-0.39'
import DataSource from '~/apis/cosmos-source'
import { updateValidatorImages } from '~/common/keybase'
import { getAllowedAddress } from '~/common/address'

export const state = () => ({
  block: undefined,
  balances: [],
  balancesLoaded: false,
  rewards: [],
  rewardsLoaded: false,
  delegations: [],
  delegationsLoaded: false,
  undelegations: [],
  undelegationsLoaded: false,
  validators: [],
  validatorsLoaded: false,
  proposals: [],
  proposalsLoaded: false,
  governanceOverview: {},
  governanceOverviewLoaded: false,
  transactions: [],
  transactionsLoaded: false,
  transactionsLoading: false,
  moreTransactionsAvailable: true,
  api: undefined,
  redirectRoute: undefined,
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
  appendProposal(state, proposal) {
    state.proposals.push(proposal)
  },
  setTransactions(state, { transactions, pageNumber }) {
    if (pageNumber > 0) {
      state.transactions = uniqBy(
        state.transactions.concat(transactions),
        'key'
      )
    } else {
      state.transactions = transactions
    }
    state.moreTransactionsAvailable = transactions.length > 0
  },
  resetSessionData(state) {
    state.balances = []
    state.rewards = []
    state.delegations = []
    state.undelegations = []
    state.rewards = []
    state.transactions = []
    state.moreTransactionsAvailable = true
  },
  setRedirectRoute(state, route) {
    state.redirectRoute = route
  },
}

export const actions = {
  init({ commit }) {
    commit('setApi', new DataSource(this.$axios, network))
  },
  // this is never awaited in the code
  async refresh({ dispatch }, session) {
    const calls = [dispatch('getBlock'), dispatch('refreshSession', session)]
    await Promise.all(calls)
  },
  async refreshSession({ dispatch }, session) {
    const calls = []
    const currency = this.$cookies.get('currency') || 'USD'
    if (session) {
      const address = session.address
      calls.push(
        dispatch('getBalances', { address, currency }),
        dispatch('getRewards', { address, currency }),
        dispatch('getTransactions', { address }),
        dispatch('getDelegations', address),
        dispatch('getUndelegations', address)
      )
    }
    await Promise.all(calls)
  },
  async getBlock({ commit, state: { api } }) {
    try {
      const block = await api.getBlock()
      commit('setBlock', block)
      return block
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting block failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getBalances({ commit, state: { api } }, { address, currency }) {
    try {
      const balances = await api.getBalances(address, currency, network)
      commit('setBalances', balances)
      commit('setBalancesLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting balances failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getValidators({ commit, dispatch, state: { api } }) {
    try {
      const validators = await api.getValidators()
      commit('setValidators', validators)
      commit('setValidatorsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting validators failed:' + err.message,
        },
        { root: true }
      )
    }
    dispatch('updateValidatorImages')
  },
  async updateValidatorImages({ state, commit }) {
    // get validator images for chunk
    await updateValidatorImages(state.validators, (updatedChunk) => {
      const updatedValidatorsDict = keyBy(updatedChunk, 'operatorAddress')
      // update the validators from our chunk
      const updatedValidators = state.validators.map((validator) => {
        const updatedValidator =
          updatedValidatorsDict[validator.operatorAddress]
        if (updatedValidator) {
          return updatedValidator
        }
        return validator
      })

      // update the store and UI
      commit('setValidators', updatedValidators)
    })
  },
  async getDelegations({ commit, state: { api } }, address) {
    try {
      const delegations = await api.getDelegationsForDelegator(address)
      commit('setDelegations', delegations)
      commit('setDelegationsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting delegations failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getUndelegations({ commit, state: { api } }, address) {
    try {
      const undelegations = await api.getUndelegationsForDelegator(address)
      commit('setUndelegations', undelegations)
      commit('setUndelegationsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting undelegations failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getRewards({ commit, state: { api } }, { address, currency }) {
    try {
      const rewards = await api.getRewards(address, currency, network)
      commit('setRewards', rewards)
      commit('setRewardsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting rewards failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getTransactions(
    { commit, state: { api } },
    { address, pageNumber = 1 }
  ) {
    try {
      commit('setTransactionsLoading', true)
      const allowedAddress = getAllowedAddress(address)
      const transactions = [].concat(
        ...(await Promise.all(
          allowedAddress.map((x) => api.getTransactions(x, pageNumber))
        ))
      )
      commit('setTransactions', { transactions, pageNumber })
      commit('setTransactionsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting transactions failed:' + err.message,
        },
        { root: true }
      )
    }
    commit('setTransactionsLoading', false)
  },
  async getProposals({ commit, state: { api } }) {
    try {
      const proposals = await api.getProposals(this.state.validators)
      commit('setProposals', proposals)
      commit('setProposalsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting proposals failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getProposal({ commit, state: { api } }, proposalId) {
    try {
      const proposal = await api.getProposal(proposalId)
      commit('appendProposal', proposal)
      commit('setProposalsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting proposal failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getProposalDetails({ commit, state: { api, proposals } }, proposal) {
    try {
      const detailsProposals = await api.getProposalDetails(proposal)
      const updatedProposals = proposals.map((p) =>
        proposal.id === p.id ? detailsProposals : p
      )
      commit('setProposals', updatedProposals)
      commit('setProposalsLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting proposal details failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getGovernanceOverview({ commit, state: { api } }) {
    try {
      const governanceOverview = await api.getGovernanceOverview()
      commit('setGovernanceOverview', governanceOverview)
      commit('setGovernanceOverviewLoaded', true)
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting governanceOverview failed:' + err.message,
        },
        { root: true }
      )
    }
  },
  async getValidatorSelfStake({ commit, state: { api } }, validator) {
    try {
      const selfStake = await api.getSelfStake(validator)
      return selfStake
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting validator self stake failed:' + err.message,
        },
        { root: true }
      )
      return 0
    }
  },
  async getValidatorDelegations({ commit, state: { api } }, validator) {
    try {
      const delegations = await api.getValidatorDelegations(validator)
      return delegations
    } catch (err) {
      commit(
        'notifications/add',
        {
          type: 'danger',
          message: 'Getting validator delegations failed:' + err.message,
        },
        { root: true }
      )
    }
    return []
  },
  setChainUpgradeAlert({ commit }) {
    if (networkConfig.isChainUpgrading) {
      commit(
        'notifications/add',
        {
          type: 'warning',
          message:
            'LikeCoin chain is being upgraded.During this period, some services may be affected until the upgrade is completed.',
        },
        { root: true }
      )
    }

    return []
  },
  async getAccountInfo({ state: { api } }, address) {
    const accountInfo = await api.getAccountInfo(address)
    return accountInfo
  },
  resetSessionData({ commit }) {
    commit('resetSessionData')
  },
  setRedirectRoute({ commit }, route) {
    commit('setRedirectRoute', route)
  },
}
