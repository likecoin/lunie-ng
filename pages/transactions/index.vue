<template>
  <div class="transactions">
    <div v-if="!transactionsLoaded || !validatorsLoaded" class="container">
      <CommonLoader />
    </div>

    <CommonCard v-else-if="!transactions.length" icon="receipt">
      <div slot="title">No transactions</div>
      <div slot="subtitle">
        {{ oldChainDataMessage }}
      </div>
    </CommonCard>

    <template v-else>
      <TransactionsEventList
        :events="transactions"
        :more-available="moreTransactionsAvailable"
        @loadMore="loadTransactions"
      />

      <div v-if="transactionsLoaded && transactionsLoading" class="loading-row">
        Loading...
      </div>

      <template v-if="transactionsLoaded && !moreTransactionsAvailable">
        <div class="container">
          <p>{{ oldChainDataMessage }}</p>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import network from '~/network'

export default {
  name: `PageTransactions`,
  middleware: 'addressRequired',
  data: () => ({
    pageNumber: 1,
    network,
  }),
  computed: {
    ...mapState('data', [
      `validators`,
      `validatorsLoaded`,
      `transactions`,
      `transactionsLoaded`,
      `transactionsLoading`,
      `moreTransactionsAvailable`,
    ]),
    ...mapState(['session']),
    oldChainDataMessage() {
      return `If you're missing transactions from this list
      they may have occured before the last blockchain upgrade.`
    },
  },
  mounted() {
    this.$store.dispatch('data/getValidators')
  },
  methods: {
    async loadTransactions() {
      if (this.moreTransactionsAvailable && !this.transactionsLoading) {
        await this.$store.dispatch('data/getTransactions', {
          address: this.session.address,
          pageNumber: this.pageNumber++,
        })
      }
    },
  },
}
</script>
<style scoped>
.container {
  display: flex;
  align-items: center;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--gray-400);
  margin: 1rem;
  font-size: 12px;
  color: var(--txt);
}

.container p {
  padding: 2rem;
}
</style>
