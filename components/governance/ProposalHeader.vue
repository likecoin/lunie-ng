<template>
  <header class="header">
    <div class="header-top-column">
      <div class="header-top-row">
        <div>
          <CommonBackButton />
        </div>

        <div class="inner-status">
          <CommonStatus :label="status.value" />
        </div>

        <div class="buttons">
          <CommonCopyButton :value="currentRoute" />
          <CommonButton
            v-if="status.value === governanceStatusEnum.DEPOSITING"
            id="deposit-btn"
            class="action-button"
            value="Deposit"
            color="primary"
            :disabled="disabled"
            @click.native="$emit(`open-deposit-modal`)"
          />
          <CommonButton
            v-if="status.value === governanceStatusEnum.VOTING"
            id="vote-btn"
            class="action-button"
            value="Vote"
            color="primary"
            :disabled="disabled"
            @click.native="$emit(`open-vote-modal`)"
          />
        </div>
      </div>

      <div class="outer-status">
        <CommonStatus :label="status.value" />
      </div>
    </div>

    <div class="id">#{{ proposal.id }}</div>
    <div class="content-container">
      <h2>{{ proposal.title }}</h2>

      <div class="proposer-container">
        <div v-if="proposal.proposer" class="proposer">
          <span>Proposed By:</span>
          <div v-if="proposal.proposer.validator" class="proposer-details">
            <div>
              <CommonAvatar
                class="proposer-image"
                :address="proposal.proposer.address"
              />
            </div>
            <nuxt-link :to="`/validators/${proposal.proposer.address}`">{{
              proposal.proposer.name
            }}</nuxt-link>
          </div>
          <CommonAddress v-else :address="proposal.proposer.address" />
        </div>
      </div>
    </div>

    <nav>
      <ul class="page-links">
        <li>
          <a v-scroll-to="'#proposal-description'" href="#">Description</a>
        </li>
        <li><a v-scroll-to="'#proposal-votes'" href="#">Votes</a></li>
        <li><a v-scroll-to="'#proposal-timeline'" href="#">Timeline</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import { governanceStatusEnum } from '~/common/proposal-status'
import { formatAddress } from '~/common/address'

export default {
  name: `ProposalHeader`,
  filters: {
    formatAddress,
  },
  props: {
    proposal: {
      type: Object,
      required: true,
    },
    status: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  data: () => ({
    governanceStatusEnum,
  }),
  computed: {
    ...mapGetters([`currentNetwork`]),
    currentRoute() {
      return location.href
    },
  },
}
</script>

<style scoped>
.header {
  padding: 2rem 0 0;
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.header-top-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 2rem;
}

.header-top-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-top-row > div:first-child,
.header-top-row > div:last-child {
  width: 33%;
  display: flex;
}

.header-top-row > div:last-child {
  justify-content: flex-end;
}

h2 {
  font-size: 32px;
  font-weight: 500;
  color: var(--bright);
}

.page-links {
  display: flex;
}

.page-links li {
  display: inline-block;
  padding: 1rem 2rem 1rem 0;
}

.action-button {
  margin-left: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

.id {
  font-weight: bold;
  font-size: 2rem;
}

.content-container {
  padding: 0.5rem 0 2rem;
}

.proposer {
  font-size: 12px;
  padding: 1rem;
  box-shadow: 0 0 3px 0 var(--gray-400);
  border-radius: var(--border-radius);
  background: var(--white);
  display: flex;
  align-items: center;
}

.icon-container {
  margin: 0 0.5rem 0 0;
}

.icon-container .success {
  opacity: 0;
  transition: opacity 250ms ease;
}

.icon-container.active .success {
  opacity: 1;
}

.outer-status {
  display: none;
}

.proposer-container {
  max-width: 300px;
}

.proposer-details {
  display: flex;
  align-items: center;
}

.proposer-details .proposer-image {
  margin: 0 0.5rem;
  min-height: 1.5rem;
  min-width: 1.5rem;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
}

@media screen and (max-width: 1023px) {
  .id {
    text-align: center;
  }

  .content-container {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .proposer-container {
    margin: 0 auto;
  }

  .page-links {
    justify-content: center;
  }

  .page-links li {
    padding: 2rem 2rem;
  }
}
</style>
