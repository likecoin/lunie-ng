<template>
  <div class="container">
    <div v-if="session" class="user-menu">
      <div>
        <h4>Your Address</h4>
        <CommonUserMenuAddress :address="session.address" />
      </div>
      <i class="material-icons icon-button" @click="signOut">logout</i>
    </div>
    <template v-else>
      <CommonButton
        value="Get Started"
        class="menu-button"
        type="secondary"
        @click.native="$router.push('/welcome')"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: `CommonUserMenu`,
  computed: {
    ...mapState(['session']),
  },
  methods: {
    signOut() {
      this.$router.push('/welcome')
      this.$store.dispatch('signIn', undefined)
    },
  },
}
</script>

<style scoped>
.container,
.user-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.container {
  margin: 1rem 1rem 3rem;
}

.user-menu {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  background: linear-gradient(
    to right,
    var(--app-user-menu-color1),
    var(--app-user-menu-color2)
  );
  box-shadow: 0 0 1px 0 var(--app-nav-shadow);
}

h4 {
  font-size: var(--text-xs);
  color: var(--app-nav-text-hover);
}

.container .button.secondary {
  color: var(--gray-300);
  width: 100%;
}

.icon-button {
  border-radius: 50%;
  height: 1.5rem;
  width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-nav);
  font-size: var(--text-base);
  border: 2px solid var(--app-nav);
}

.icon-button:hover {
  cursor: pointer;
  color: var(--teal-800);
}

.button.menu-button {
  box-shadow: 0 0 2px 0 rgba(210, 210, 210, 0.1);
}

.button.menu-button.secondary:hover:not(:disabled) {
  background: rgba(210, 210, 210, 0.1);
}
</style>
