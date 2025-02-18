<template>
  <ModalAction
    id="undelegation-modal"
    ref="ModalAction"
    :validate="validateForm"
    :amounts="[]"
    title="Unstake"
    class="undelegation-modal"
    submission-error-prefix="Unstaking failed"
    :transaction-type="lunieMessageTypes.UNDELEGATE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="undelegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <CommonFormGroup
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <CommonField
        id="from"
        :value="enhancedSourceValidator"
        type="text"
        readonly
      />
    </CommonFormGroup>
    <CommonFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <div class="row">
        <CommonField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <CommonButton
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </div>
      <span v-if="maximum > 0" class="form-message">
        Currently staked: {{ maximum }} {{ stakingDenom }}
      </span>
      <span v-else-if="maximum === 0" class="form-message">
        You don't have any tokens staked with this validator.
      </span>
      <CommonFormMessage
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${stakingDenom} to proceed.`"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <CommonFormMessage
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
    </CommonFormGroup>
  </ModalAction>
</template>

<script>
import { mapState } from 'vuex'
import { required, decimal } from 'vuelidate/lib/validators'
import { SMALLEST } from '~/common/numbers'
import { validatorEntry } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `Unstake`,
  filters: {
    validatorEntry,
  },
  props: {
    sourceValidator: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    amount: null,
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    stakingDenom: network.stakingDenom,
    network,
  }),
  computed: {
    ...mapState(`data`, [`delegations`]),
    maximum() {
      const delegation = this.delegations.find(
        ({ validator }) =>
          validator.operatorAddress === this.sourceValidator.operatorAddress
      )
      return delegation ? Number(delegation.amount) : 0
    },
    transactionData() {
      return {
        type: lunieMessageTypes.UNSTAKE,
        from:
          this.sourceValidator && this.sourceValidator.operatorAddress
            ? [this.sourceValidator.operatorAddress]
            : null,
        amount: {
          amount: this.amount,
          denom: this.stakingDenom,
        },
      }
    },
    notifyMessage() {
      return {
        title: `Successfully unstaked!`,
        body: `You have successfully unstaked ${this.amount} ${this.stakingDenom}.`,
      }
    },
    undelegationPeriod() {
      return network.lockUpPeriod
    },
    enhancedSourceValidator() {
      return validatorEntry(this.sourceValidator)
    },
  },
  validations() {
    return {
      amount: {
        required,
        decimal,
        max: (x) => Number(x) <= this.maximum,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          return Number(x).toString().split('.').length > 1
            ? Number(x).toString().split('.')[1].length <= 9
            : true
        },
      },
    }
  },
  methods: {
    open() {
      this.$refs.ModalAction.open()
    },
    validateForm() {
      this.$v.$touch()
      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.maximum
    },
    enterPressed() {
      this.$refs.ModalAction.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
  },
}
</script>
