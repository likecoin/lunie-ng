<template>
  <div class="session-container">
    <h2 class="session-title">Authcore</h2>

    <div v-if="isSigningIn" class="session-main">
      <p>Signing in...</p>
    </div>

    <div v-else-if="loading" class="session-main">
      <p>Loading...</p>
    </div>

    <div v-else class="session-main">
      <div id="authcore-register-container" />
    </div>

    <div v-if="error" class="error-container">
      <p>There was an error connecting to the Authcore:<br /></p>
      <p class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { AuthCoreWidgets } from '@likecoin/authcore-js'
import network from '~/common/network'
import signInRedirect from '~/mixins/signInRedirect'

export default {
  name: `SessionAuthcore`,
  mixins: [signInRedirect],
  layout: 'session',
  data() {
    return {
      widget: undefined,
    }
  },
  computed: {
    ...mapState('authcore', [`accounts`, `error`, `loading`]),
    isSigningIn() {
      const { code } = this.$route.query
      return !!code
    },
  },
  async mounted() {
    if (!this.isSigningIn) {
      this.$nextTick(() => this.initWidget())
    } else {
      const { code, ...query } = this.$route.query
      try {
        await this.$store.dispatch('authcore/init', code)
      } catch (err) {
        console.error(err)
      }
      const { accounts } = this
      if (accounts && accounts.length) {
        this.signInAndRedirect(accounts[0])
      } else {
        this.$router.replace({ ...this.$route, query })
        this.$nextTick(() => this.initWidget())
      }
    }
  },
  methods: {
    initWidget() {
      this.widget = new AuthCoreWidgets.Login({
        primaryColour: '#28646e',
        container: 'authcore-register-container',
        root: `${network.authcoreURL}/widgets`,
        initialScreen: 'signin',
        successRedirectUrl: `${network.siteURL}/authcore`,
        socialLoginPaneStyle: 'top',
        socialLoginPaneOption: 'grid',
        internal: true,
      })
    },
    signIn(account) {
      this.$store.dispatch(`signIn`, {
        sessionType: `authcore`,
        address: account,
      })
    },
    async signInAndRedirect(account) {
      await this.signIn(account)
      this.signInRedirect()
    },
  },
}
</script>
<style scoped>
.session-main {
  display: flex;
  justify-content: center;
}

#authcore-register-container {
  flex: 1;
}

.accounts {
  flex-direction: column;
}

.extension-message {
  text-align: center;
}
</style>
