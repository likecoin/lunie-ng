<template>
  <div id="app" class="lunie-light">
    <CommonAppHeader />
    <CommonNotifications />
    <div id="app-content">
      <Nuxt />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Layout',
  middleware({ store }) {
    if (!store.state.data.api) {
      store.dispatch('data/init') // init api
    }
  },
  computed: {
    ...mapState(['session']),
    ...mapState(['data', ['validators']]),
  },
  mounted() {
    const session = this.$cookies.get('lunie-session')
    this.$store.dispatch('signIn', session) // calls 'data/refresh' to load the users data
    this.$store.dispatch('data/setChainUpgradeAlert') // shows warning message if the network config 'isChainUpgrading' is true
  },
}
</script>
<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.1s;
}

.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>
