<template>
  <b-modal
    :id="`kevAssertionsModal-${index}`"
    size="lg"
    hide-header-close
    no-stacking
    @show="fetchAssertions"
  >
    <template v-slot:modal-title>
      {{ $t('message.kev_assertions') }}: {{ vulnId }}
    </template>
    <p>{{ $t('message.kev_explanation') }}</p>
    <div v-if="!assertions.length">
      {{ $t('message.no_kev_assertions') }}
    </div>
    <b-card
      v-for="(assertion, i) in assertions"
      :key="i"
      class="mb-3 kev-assertion-card"
      no-body
    >
      <b-card-header class="d-flex align-items-center">
        <i class="fa fa-fire text-danger mr-2" aria-hidden="true"></i>
        <strong>{{ (assertion.asserter || '').toUpperCase() }}</strong>
        <b-badge
          v-if="assertion.known_ransomware === true"
          variant="danger"
          class="ml-2"
        >
          {{ $t('message.known_ransomware') }}
        </b-badge>
      </b-card-header>
      <b-card-body>
        <dl class="row mb-0">
          <dt class="col-sm-3">{{ $t('message.asserted_for') }}</dt>
          <dd class="col-sm-9">
            <span v-html="formatSourceLabel(assertion.vuln_source)"></span>
            {{ assertion.vuln_id }}
          </dd>

          <template v-if="assertion.published_at">
            <dt class="col-sm-3">{{ $t('message.published') }}</dt>
            <dd class="col-sm-9">
              {{ formatTimestamp(assertion.published_at) }}
            </dd>
          </template>

          <template v-if="assertion.required_action">
            <dt class="col-sm-3">{{ $t('message.required_action') }}</dt>
            <dd class="col-sm-9">{{ assertion.required_action }}</dd>
          </template>

          <template v-if="assertion.description">
            <dt class="col-sm-3">{{ $t('message.description') }}</dt>
            <dd class="col-sm-9">{{ assertion.description }}</dd>
          </template>
        </dl>
      </b-card-body>
    </b-card>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">
        {{ $t('message.close') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import common from '@/shared/common';

export default {
  name: 'KevAssertionsModal',
  props: {
    source: String,
    vulnId: String,
    index: [Number, String],
  },
  data() {
    return {
      assertions: [],
    };
  },
  methods: {
    formatTimestamp: common.formatTimestamp,
    formatSourceLabel: common.formatSourceLabel,
    fetchAssertions() {
      const url = `${this.$api.BASE_URL}/api/v2/vulns/${encodeURIComponent(
        this.source,
      )}/${encodeURIComponent(this.vulnId)}/kev-assertions`;
      this.axios.get(url).then((response) => {
        this.assertions = response.data.items || [];
      });
    },
  },
};
</script>

<style scoped>
.kev-assertion-card {
  border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent);
  border-left: 4px solid var(--danger);
  background-color: color-mix(in srgb, var(--danger) 6%, transparent);
}
.kev-assertion-card ::v-deep .card-header {
  background-color: color-mix(in srgb, var(--danger) 12%, transparent);
  border-bottom-color: color-mix(in srgb, var(--danger) 30%, transparent);
}
</style>
