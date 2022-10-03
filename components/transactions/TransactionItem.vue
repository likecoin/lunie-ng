<template>
  <div v-if="transactionCaption" class="tx-container">
    <a
      class="transaction"
      :href="network.apiURL + '/cosmos/tx/v1beta1/txs/' + transaction.hash"
      target="_blank"
      rel="nofollow noreferrer noopener"
    >
      <div class="left">
        <div class="icon" :style="`background-image: url(${imagePath})`"></div>
        <div class="title-and-images">
          <div>
            <h3>{{ transactionCaption }}</h3>
            <template v-if="transactionCaption === `Send`">
              <p
                v-for="(address, index) in transaction.details.to"
                :key="address + index"
              >
                to: {{ address }}
              </p>
            </template>
            <template v-if="transactionCaption === `SendMultiple`">
              <p>
                {{ sendMultipleTosCount }}
              </p>
            </template>
            <template v-if="transactionCaption === `ReceiveMultiple`">
              <p>
                {{ receiveMultipleSenderAddress }}
              </p>
            </template>
            <template v-if="transactionCaption === `Receive`">
              <p
                v-for="(address, index) in transaction.details.from"
                :key="address + index"
              >
                {{ address }}
              </p>
            </template>
            <template
              v-if="
                transactionCaption === `Create ISCN Record` ||
                transactionCaption === `Update ISCN Record` ||
                transactionCaption === `Change ISCN Ownership`
              "
            >
              <p>
                {{ iscnId }}
              </p>
            </template>
            <template v-if="nftClassId">
              <p>{{ nftClassId }}</p>
            </template>
          </div>
          <div v-if="includesValidatorAddresses" class="validator-images">
            <template v-for="(address, index) in transaction.details.from">
              <CommonAvatar
                :key="index + '_from_avatar'"
                class="validator-image"
                alt="placeholder color for validator image"
                :address="address"
                @click.prevent.self
                @click="$router.push(`/validators/${address}`)"
              />
            </template>
            <template v-for="(address, index) in transaction.details.to">
              <CommonAvatar
                :key="index + '_to_avatar'"
                class="validator-image"
                alt="placeholder color for validator image"
                :address="address"
                @click.prevent.self
                @click="$router.push(`/validators/${address}`)"
              />
            </template>
          </div>
        </div>
      </div>
      <div class="right">
        <div v-if="amounts" class="amounts">
          <p v-for="(item, index) in amounts" :key="index">
            {{ item.amount | prettyLong }}
            {{ item.denom }}
          </p>
        </div>
        <div class="launch">
          <i class="material-icons notranslate launch-icon">launch</i>
        </div>
      </div>
    </a>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { mapState } from 'vuex'
import { lunieMessageTypes } from '~/common/lunie-message-types'
import { prettyLong } from '~/common/numbers'
import network from '~/common/network'
import { getAllowedAddress } from '~/common/address'

const LIKECOIN_NFT_API_WALLET =
  network.id === 'likecoin-mainnet-2'
    ? 'like17m4vwrnhjmd20uu7tst7nv0kap6ee7js69jfrs'
    : 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp'

export default {
  name: `Transaction`,
  filters: {
    prettyLong,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    network,
  }),
  computed: {
    ...mapState(['session']),
    transactionCaption() {
      const allowedAddress = getAllowedAddress(this.session.address)
      switch (this.transaction.type) {
        case lunieMessageTypes.SEND:
          if (
            allowedAddress.some((item) =>
              this.transaction.details.to.includes(item)
            )
          ) {
            return 'Receive'
          } else if (
            allowedAddress.some((item) =>
              this.transaction.details.from.includes(item)
            )
          ) {
            return 'Send'
          } else {
            return ''
          }
        case lunieMessageTypes.SEND_MULTIPLE:
          if (
            this.transaction.rawMessage.message.outputs.filter((a) =>
              allowedAddress.includes(a.address)
            ).length > 0
          ) {
            return 'ReceiveMultiple'
          } else {
            return 'SendMultiple'
          }
        case lunieMessageTypes.STAKE:
          return `Stake`
        case lunieMessageTypes.RESTAKE:
          return `Restake`
        case lunieMessageTypes.UNSTAKE:
          return `Unstake`
        case lunieMessageTypes.DEPOSIT:
          return `Deposit`
        case lunieMessageTypes.VOTE:
          return `Vote`
        case lunieMessageTypes.CLAIM_REWARDS:
          return `Claim Rewards`
        case lunieMessageTypes.CREATE_ISCN_RECORD:
          return `Create ISCN Record`
        case lunieMessageTypes.UPDATE_ISCN_RECORD:
          return `Update ISCN Record`
        case lunieMessageTypes.CHANGE_ISCN_OWNERSHIP:
          return `Change ISCN Ownership`
        case lunieMessageTypes.CREATE_NFT_CLASS:
          return `Create NFT Class`
        case lunieMessageTypes.MINT_NFT:
          return `Mint NFT`
        case lunieMessageTypes.GRANT:
          if (
            allowedAddress.some((item) =>
              this.transaction.details.from.includes(item)
            ) &&
            this.transaction.details.grantee === LIKECOIN_NFT_API_WALLET
          ) {
            return `Collect NFT`
          } else {
            return `Grant`
          }
        case lunieMessageTypes.TRANSFER_NFT:
          if (allowedAddress.includes(this.transaction.details.to)) {
            return `Receive NFT`
          } else if (allowedAddress.includes(this.transaction.details.from)) {
            return `Transfer NFT`
          } else {
            return ``
          }
        case lunieMessageTypes.UNKNOWN:
          return this.transaction.rawMessage.message['@type'].split('/')[1]
        /* istanbul ignore next */
        default:
          return ``
      }
    },
    iscnId() {
      if (
        this.transaction.type === lunieMessageTypes.CREATE_ISCN_RECORD ||
        this.transaction.type === lunieMessageTypes.UPDATE_ISCN_RECORD ||
        this.transaction.type === lunieMessageTypes.CHANGE_ISCN_OWNERSHIP
      ) {
        for (let i = 0; i < this.transaction.events.length; i++) {
          if (this.transaction.events[i]) {
            for (let j = 0; j < this.transaction.events[i].length; j++) {
              const iscnEvent = this.transaction.events[i][j].attributes.find((a) => a.key === 'iscn_id') // eslint-disable-line prettier/prettier
              if (iscnEvent) return iscnEvent.value
            }
          }
        }
        return 'Can not find ISCN ID'
      } else {
        return ''
      }
    },
    receiveMultipleSenderAddress() {
      const allowedAddress = getAllowedAddress(this.session.address)
      if (
        this.transaction.rawMessage.message.outputs.filter((a) =>
          allowedAddress.includes(a.address)
        ).length > 0
      ) {
        return `from: ${this.transaction.rawMessage.message.inputs[0].address}`
      } else {
        return ''
      }
    },
    sendMultipleTosCount() {
      let receiverCount = 0
      if (this.transaction.rawMessage.message.outputs) {
        receiverCount = this.transaction.rawMessage.message.outputs.length
      }
      return `to ${receiverCount} addresses`
    },
    imagePath() {
      try {
        let imgName = this.transactionCaption.replace(/\s+/g, '')
        if (
          imgName === 'CreateISCNRecord' ||
          imgName === 'UpdateISCNRecord' ||
          imgName === 'ChangeISCNOwnership'
        ) {
          imgName = 'ISCN'
        }
        return require(`../../assets/images/transactions/${imgName}.svg`)
      } catch {
        return require('../../assets/images/transactions/Unknown.svg')
      }
    },
    includesValidatorAddresses() {
      return [
        lunieMessageTypes.STAKE,
        lunieMessageTypes.UNSTAKE,
        lunieMessageTypes.RESTAKE,
        lunieMessageTypes.CLAIM_REWARDS,
      ].includes(this.transaction.type)
    },
    amounts() {
      const allowedAddress = getAllowedAddress(this.session.address)
      if (
        this.transaction.details.amounts &&
        this.transaction.type !== lunieMessageTypes.SEND_MULTIPLE) { // eslint-disable-line prettier/prettier
        return this.transaction.details.amounts
      } else if (this.transaction.details.amount) {
        return Array.isArray(this.transaction.details.amount)
          ? this.transaction.details.amount
          : [this.transaction.details.amount]

        // sendMultiple:
      } else if (
        this.transaction.type === lunieMessageTypes.SEND_MULTIPLE &&
        allowedAddress.includes(this.transaction.details.from[0])
        // eslint-disable-line prettier/prettier
      ) {
        let totalAmount = new BigNumber(0)
        this.transaction.details.amounts.forEach((a) => {
          totalAmount = totalAmount.plus(a.amount)
        })
        const sendAmount = {}
        if (totalAmount) {
          sendAmount.amount = totalAmount.toFixed()
          sendAmount.denom = this.transaction.details.amounts[0].denom
        }
        return [sendAmount]

        // receiveMultiple:
      } else if (this.transaction.type === lunieMessageTypes.SEND_MULTIPLE) {
        const targetReceiverIndex = this.transaction.details.to.findIndex((o) =>
          allowedAddress.includes(o)
        )
        const receivedLIKE = this.transaction.details.amounts[
          targetReceiverIndex
        ]
        return [receivedLIKE]
      }
      return null
    },
    nftClassId() {
      if (
        this.transaction.type === lunieMessageTypes.CREATE_NFT_CLASS ||
        this.transaction.type === lunieMessageTypes.MINT_NFT ||
        this.transaction.type === lunieMessageTypes.TRANSFER_NFT
      ) {
        return this.transaction.details.nftClassId
      } else {
        return ''
      }
    },
  },
}
</script>

<style scoped>
.transaction {
  position: relative;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-bg);
  border-radius: var(--border-radius);
  z-index: 90;
  padding: 0.75rem 1rem;
  margin: 1rem 1rem 0 1rem;
  cursor: pointer;
  box-shadow: 0 0 1px 0 var(--gray-500);
}

.icon {
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 50%;
  display: inline-flex;
  background-color: var(--gray-300);
  background-size: contain;
}

.transaction:hover {
  background: var(--gray-100);
}

.left {
  display: flex;
  flex-direction: row;
}

.title-and-images {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-and-images p {
  color: var(--dim);
  padding: 0 2rem 0 1rem;
  font-size: var(--text-xs);
  word-break: break-all;
}

.validator-images {
  padding: 0 0 0 1rem;
  display: inline-flex;
}

.validator-images img {
  height: 1.25rem;
  width: 1.25rem;
}

.right {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h3 {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--txt);
  padding-left: 1rem;
}

.amounts {
  color: var(--txt);
  font-size: var(--text-sm);
}

.validator-image {
  height: 1.25rem;
  width: 1.25rem;
  margin: 0 0.5rem 0 0;
  border-radius: 50%;
  box-shadow: 0 0 3px 0 var(--gray-500);
}

.launch {
  z-index: 91;
  cursor: pointer;
  border-radius: 50%;
  background: var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  transition: transform 0.2s ease;
  margin-left: 1rem;
}

.launch i {
  font-size: 16px;
  position: relative;
  color: var(--link);
  top: 1px;
}

@media screen and (max-width: 767px) {
  .title-and-images {
    flex-direction: column;
    align-items: start;
  }

  .title-and-images p {
    padding-left: 0;
  }

  h3 {
    padding-left: 0;
  }

  .amounts {
    text-align: right;
  }

  .validator-images {
    padding: 0.5rem 0 0 0;
  }

  .icon {
    display: none;
  }

  .launch {
    display: none;
  }
}
</style>
