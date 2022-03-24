import network from '~/network'

export default {
  ...network.fees,
  getFees(transactionType) {
    // Use default fees if transactionType is not 'ClaimRewardsTx'
    const fees = this[transactionType] || this.default
    return fees
  },
}
