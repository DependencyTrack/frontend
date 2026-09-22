<template>
  <b-list-group-item>
    <div class="d-flex w-100 justify-content-between">
      <span class="text-monospace text-break mr-3">{{ binding.subject }}</span>
      <b-button
        size="sm"
        class="action-icon ml-3 flex-shrink-0"
        v-on:click="$emit('removeClicked')"
        v-b-tooltip.hover
        :title="$t('admin.remove_workload_identity_binding')"
      >
        <span class="fa fa-trash-o"></span>
      </b-button>
    </div>
    <pre
      v-if="binding.condition"
      class="binding-condition text-monospace small my-2"
      >{{ binding.condition }}</pre
    >
    <small class="binding-details text-muted mt-2">
      <span>{{ $t('message.provider') }}:</span>
      <span>{{ binding.provider_name }}</span>
      <span>{{ $t('message.created') }}:</span>
      <span>{{ createdTimestamp }}</span>
      <span>{{ $t('admin.api_key_last_used') }}:</span>
      <span>{{ lastUsedTimestamp }}</span>
    </small>
  </b-list-group-item>
</template>

<script>
import common from '../../../shared/common';

export default {
  props: {
    binding: { type: Object, required: true },
  },
  computed: {
    createdTimestamp() {
      return common.formatTimestamp(this.binding.created_at, true);
    },
    lastUsedTimestamp() {
      return this.binding.last_used_at
        ? common.formatTimestamp(this.binding.last_used_at, true)
        : 'N/A';
    },
  },
};
</script>

<style lang="scss" scoped>
.binding-details {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.5rem;
}

.binding-condition {
  white-space: pre-wrap;
  word-break: break-word;
  color: inherit;
}

.action-icon {
  padding: 0;
  margin: 0;
  border: 0;
  background-color: transparent;
}

.action-icon .fa {
  font-size: 1.2rem;
}

.action-icon .fa-trash-o {
  color: var(--danger);
}
</style>
