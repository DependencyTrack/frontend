<template>
  <b-modal :id="modalId" size="lg" hide-header-close ok-only>
    <template v-slot:modal-title>{{
      $t('message.hash_verification.modal_title')
    }}</template>

    <p>
      <i
        :class="['fa', 'mr-2', statusIcon, statusColorClass]"
        aria-hidden="true"
      ></i>
      <strong>{{ statusLabel }}</strong>
    </p>

    <p v-if="explanation">{{ explanation }}</p>

    <p v-if="repositoryIdentifier">
      <strong>{{ $t('message.hash_verification.resolved_from') }}:</strong>
      {{ repositoryIdentifier }}
    </p>

    <b-list-group v-if="rows.length > 0">
      <b-list-group-item v-for="row in rows" :key="row.algorithm">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>{{ row.algorithm }}</strong>
          <i
            :class="[
              'fa',
              row.match === 'PASSED'
                ? 'fa-check status-passed'
                : 'fa-times status-failed',
            ]"
            aria-hidden="true"
          ></i>
        </div>
        <dl class="row mb-0">
          <dt class="col-sm-3 font-weight-normal">
            {{ $t('message.hash_verification.component_hash') }}
          </dt>
          <dd class="col-sm-9 text-monospace text-break mb-1">
            {{ row.componentHash }}
          </dd>
          <dt class="col-sm-3 font-weight-normal">
            {{ $t('message.hash_verification.repository_hash') }}
          </dt>
          <dd class="col-sm-9 text-monospace text-break mb-0">
            {{ row.repositoryHash }}
          </dd>
        </dl>
      </b-list-group-item>
    </b-list-group>
  </b-modal>
</template>

<script>
import {
  HASH_ALGORITHMS,
  getHashVerificationStatusInfo,
  hashStatusLabel,
  normalizeHashes,
} from '@/shared/hashVerificationStatus';

export default {
  name: 'HashVerificationModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: null,
    },
    componentHashes: {
      type: Object,
      default: () => ({}),
    },
    repositoryHashes: {
      type: Object,
      default: () => ({}),
    },
    repositoryIdentifier: {
      type: String,
      default: null,
    },
  },
  computed: {
    statusInfo() {
      return getHashVerificationStatusInfo(this.status);
    },
    statusLabel() {
      return hashStatusLabel(this.$t.bind(this), this.status);
    },
    statusIcon() {
      return this.statusInfo.icon;
    },
    statusColorClass() {
      return this.statusInfo.color;
    },
    explanation() {
      switch (this.status) {
        case 'PASSED':
          return this.$t('message.hash_verification.passed_explanation');
        case 'FAILED':
          return this.$t('message.hash_verification.failed_explanation');
        case 'UNKNOWN':
          return this.$t('message.hash_verification.no_common_algorithm');
        case 'NO_COMPONENT_HASH':
          return this.$t(
            'message.hash_verification.no_component_hash_explanation',
          );
        case 'NO_REPOSITORY_HASH':
          return this.$t(
            'message.hash_verification.no_repository_hash_explanation',
          );
        default:
          return null;
      }
    },
    rows() {
      const component = normalizeHashes(this.componentHashes);
      const repository = normalizeHashes(this.repositoryHashes);
      return HASH_ALGORITHMS.filter(
        (a) => a in component && a in repository,
      ).map((a) => ({
        algorithm: a.toUpperCase(),
        componentHash: component[a],
        repositoryHash: repository[a],
        match: component[a] === repository[a] ? 'PASSED' : 'FAILED',
      }));
    },
  },
};
</script>
