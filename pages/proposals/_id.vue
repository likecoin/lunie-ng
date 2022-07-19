<template>
  <div>
    <div v-if="!proposalsLoaded && !proposal">
      <CommonLoader />
    </div>
    <div v-else class="proposal">
      <GovernanceProposalHeader
        :proposal="proposal"
        :status="status"
        :disabled="isChainUpgrading"
        @open-vote-modal="onVote"
        @open-deposit-modal="onDeposit"
      />

      <GovernanceProposalDescription :proposal="proposal" />

      <GovernanceProposalStatusBar
        v-if="tallyHasValues"
        :status="status"
        :status-begin-time="proposal.statusBeginTime"
        :total-votes="proposal.tally.total"
        :proposal="proposal"
      />
      <div v-if="!proposal.detailedVotes" class="loading container">
        <CommonLoader />
      </div>
      <template v-else>
        <GovernanceTimeline
          v-if="proposal.detailedVotes.timeline.length"
          :timeline="proposal.detailedVotes.timeline"
        />
        <GovernanceParticipantList
          v-if="participants"
          :participants="participants"
          :show-amounts="true"
        />
      </template>

      <ModalDeposit
        v-if="shouldShowDepositModal"
        ref="ModalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :denom="parameters.depositDenom || network.stakingDenom"
        :deposits="proposal.detailedVotes.deposits"
        @success="() => afterVoteOrDeposit()"
      />
      <ModalVote
        v-else
        ref="ModalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVoteOrDeposit()"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import BigNumber from 'bignumber.js'
import { percent, prettyInt } from '~/common/numbers'
import { date, fromNow } from '~/common/time'
import {
  getProposalStatus,
  governanceStatusEnum,
} from '~/common/proposal-status'
import network from '~/common/network'
import networkConfig from '~/network'

export default {
  name: `PageProposal`,
  filters: {
    prettyInt,
    percent,
    date,
    fromNow,
    lowerCase: (text) => (text ? text.toLowerCase() : ''),
  },
  data: () => ({
    vote: undefined,
    parameters: {
      depositDenom: '',
    },
    error: undefined,
    found: false,
    loaded: false,
    governanceStatusEnum,
    network,
  }),
  computed: {
    ...mapState('data', ['proposals', 'proposalsLoaded']),
    proposal() {
      if (this.proposals && this.proposals.length > 0) {
        return this.proposals.find(({ id }) => id === this.proposalId)
      } else {
        return null
      }
    },
    proposalId() {
      return Number(this.$route.params.id)
    },
    status() {
      return this.proposal ? getProposalStatus(this.proposal) : null
    },
    noVotes() {
      return BigNumber(this.proposal.tally.total).eq(0)
    },
    tallyHasValues() {
      return Object.values(this.proposal.tally)
        .filter((value) => value !== `Tally`)
        .find((value) => value)
    },
    participants() {
      const { detailedVotes } = this.proposal
      if (detailedVotes) {
        if (detailedVotes.votes && detailedVotes.votes.length > 0) {
          return detailedVotes.votes.map((vote) => ({
            ...vote.voter,
            amount: vote.amount,
            option: vote.option,
          }))
        } else if (
          detailedVotes.deposits &&
          detailedVotes.deposits.length > 0
        ) {
          // a bit hacky but working
          return detailedVotes.deposits.map((deposit) => ({
            ...deposit.depositer,
            amount: deposit.amount[0],
          }))
        }
      }
      return undefined
    },
    shouldShowDepositModal() {
      return (
        this.proposal.detailedVotes &&
        this.status.value === governanceStatusEnum.DEPOSITING
      )
    },
    isChainUpgrading() {
      return !!networkConfig.isChainUpgrading
    },
  },
  watch: {
    proposal() {
      this.getProposalDetails()
    },
  },
  mounted() {
    this.$store.dispatch('data/getProposals')
    if (this.proposal) {
      this.getProposalDetails()
    }
  },
  methods: {
    getProposalDetails() {
      if (this.proposal.detailedVotes) return
      this.$store.dispatch('data/getProposalDetails', this.proposal)
    },
    onVote() {
      Vue.nextTick(() => {
        this.$refs.ModalVote.open()
      })
    },
    afterVoteOrDeposit() {
      this.$store.dispatch('data/getProposals')
    },
    onDeposit() {
      Vue.nextTick(() => {
        this.$refs.ModalDeposit.open()
      })
    },
  },
}
</script>
<style scoped>
.proposal {
  margin: 2rem;
  padding: 1.5rem 2rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  max-width: 1024px;
}

.loading.container {
  border-radius: var(--border-radius);
  box-shadow: 0 0 3px 0 var(--gray-400);
}

@media screen and (max-width: 667px) {
  .proposal {
    border-radius: 0;
    box-shadow: none;
    max-width: none;
    margin: 0;
  }
}

@media screen and (min-width: 1324px) {
  .proposal {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
