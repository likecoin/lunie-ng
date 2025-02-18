<template>
  <div>
    <div class="session-back">
      <a @click="onBack">
        <i class="material-icons notranslate circle back">arrow_back</i>
      </a>
    </div>
    <CommonSteps :steps="steps" :active-step="step" />
    <AddressImportSeedStep
      v-if="step === 'Recover'"
      :seed="seed"
      @submit="setSeed"
    />
    <AddressImportNameStep
      v-if="step === 'Name'"
      :address="address"
      :name="name"
      @submit="setName"
    />
    <AddressPasswordStep
      v-if="step === 'Password'"
      :password="password"
      @submit="setPassword"
    />
    <CommonFormMessage v-if="errorMessage" type="custom" :msg="errorMessage" />
  </div>
</template>

<script>
import { storeWallet } from '~/common/keystore'
import network from '~/common/network'
import { getHDPath } from '~/common/hdpath'

export default {
  name: `SessionRecover`,
  layout: 'session',
  middleware: 'localSigning',
  data: () => ({
    steps: [`Recover`, `Name`, `Password`],
    step: 'Recover',
    name: undefined,
    password: undefined,
    seed: undefined,
    address: undefined,
    errorMessage: undefined,
  }),
  methods: {
    onBack() {
      const stepIndex = this.steps.findIndex((step) => step === this.step)
      if (stepIndex === 0) return this.$router.go(-1)
      this.errorMessage = undefined
      this.step = this.steps[stepIndex - 1]
    },
    setName(name) {
      this.name = name
      this.step = `Password`
    },
    setPassword(password) {
      this.password = password
      this.onSubmit()
    },
    async setSeed(seed) {
      this.seed = seed
      const { Secp256k1HdWallet } = await import('@cosmjs/amino')
      const wallet = await Secp256k1HdWallet.fromMnemonic(
        this.seed,
        await getHDPath(network.HDPath),
        network.addressPrefix
      )
      this.address = wallet.address
      this.step = `Name`
    },
    async onSubmit() {
      if (this.loading) return

      this.errorMessage = undefined
      this.loading = true
      try {
        const { Secp256k1HdWallet } = await import('@cosmjs/amino')
        const wallet = await Secp256k1HdWallet.fromMnemonic(
          this.seed,
          await getHDPath(network.HDPath),
          network.addressPrefix
        )
        storeWallet(
          await wallet.serialize(this.password),
          wallet.address,
          this.name,
          network.HDPath
        )
        this.$store.dispatch('signIn', {
          address: wallet.address,
          sessionType: 'local',
        })
        this.$router.push({
          name: 'index',
        })
      } catch (error) {
        this.loading = false
        this.errorMessage = error.message
      }
    },
  },
}
</script>
