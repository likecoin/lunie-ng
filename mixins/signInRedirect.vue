<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('data', ['redirectRoute']),
  },
  methods: {
    signInRedirect() {
      if (this.redirectRoute) {
        this.$router.push(this.redirectRoute)
        this.$store.dispatch('data/setRedirectRoute', undefined)
      } else {
        this.$router.push('/')
      }
    },
  },
}
</script>
