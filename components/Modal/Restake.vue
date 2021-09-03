<template>
  <ModalAction
    id="redelegation-modal"
    ref="ModalAction"
    :validate="validateForm"
    :amounts="[]"
    title="Restake"
    class="redelegation-modal"
    submission-error-prefix="Restaking failed"
    :transaction-type="lunieMessageTypes.RESTAKE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="restake"
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
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <CommonField
        id="to"
        v-model="destinationValidatorAddress"
        :options="sortedEnrichedValidators"
        type="select"
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
          placeholder="0"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <CommonButton
          type="button"
          class="secondary addon-max"
          value="Max"
          @click.native="setMaxAmount()"
        />
      </div>
      <span v-if="maximum > 0" class="form-message">
        Currently staked: {{ maximum }} {{ stakingDenom }}
      </span>
      <span v-else-if="maximum === 0" class="form-message">
        You don't have any tokens staked with this validator.
      </span>
      <FormMessage
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${stakingDenom} to proceed.`"
      />
      <FormMessage
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <FormMessage
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
import { orderBy } from 'lodash'
import { SMALLEST } from '~/common/numbers'
import { validatorEntry } from '~/common/address'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import network from '~/common/network'

export default {
  name: `RestakeModal`,
  filters: {
    validatorEntry,
  },
  props: {
    sourceValidator: {
      type: Object,
      default: () => ({}),
    },
    validators: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    amount: null,
    lunieMessageTypes,
    smallestAmount: SMALLEST,
    stakingDenom: network.stakingDenom,
    network,
    destinationValidatorAddress: null,
    sort: {
      property: `votingPower`,
      order: `desc`,
    },
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
        type: lunieMessageTypes.RESTAKE,
        from:
          this.sourceValidator && this.sourceValidator.operatorAddress
            ? [this.sourceValidator.operatorAddress]
            : null,
        to: this.destinationValidatorAddress
          ? [this.destinationValidatorAddress]
          : null,
        amount: {
          amount: this.amount,
          denom: this.stakingDenom,
        },
      }
    },
    notifyMessage() {
      return {
        title: `Successfully restaked!`,
        body: `You have successfully restaked ${this.amount} ${this.stakingDenom}.`,
      }
    },
    enhancedSourceValidator() {
      return validatorEntry(this.sourceValidator)
    },
    sortedEnrichedValidators() {
      const orderedValidators = orderBy(
        this.validators,
        [this.sort.property],
        [this.sort.order]
      )
        .filter(
          (validator) =>
            validator.operatorAddress !== this.sourceValidator.operatorAddress
        )
        .map((validator) => ({
          key: this.enhancedDestinationValidator(validator),
          value: validator.operatorAddress,
        }))
      return orderedValidators
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
            ? Number(x).toString().split('.')[1].length <= 6
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
    enhancedDestinationValidator(destinationValidator) {
      const prefix =
        destinationValidator.status === 'INACTIVE' ? '(inactive) ' : ''
      return prefix + validatorEntry(destinationValidator)
    },
  },
}
</script>
