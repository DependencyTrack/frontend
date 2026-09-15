<template>
  <b-list-group-item>
    <div class="d-flex w-100 justify-content-between">
      <span class="text-truncate mr-3">
        <span
          class="text-muted"
          v-b-tooltip.hover
          :title="$t('admin.api_key_public_id_tooltip')"
          >{{ $t('admin.api_key_public_id') }}:</span
        >
        <span class="text-monospace ml-2">{{ apiKey.publicId }}</span>
      </span>
      <div class="d-flex flex-shrink-0">
        <b-badge
          v-if="expiryState"
          class="ml-3 align-self-center"
          :variant="expiryState === 'expired' ? 'danger' : 'warning'"
          v-b-tooltip.hover
          :title="$t('admin.api_key_replace_tooltip')"
          >{{
            expiryState === 'expired'
              ? $t('admin.api_key_expired')
              : $t('admin.api_key_expiring')
          }}</b-badge
        >
        <span
          v-if="apiKey.legacy"
          class="ml-3"
          v-b-tooltip.hover
          :title="$t('admin.old_key_format')"
          ><i
            class="fa fa-exclamation-triangle status-warning"
            aria-hidden="true"
          ></i
        ></span>
        <b-button
          v-if="editable"
          size="sm"
          class="action-icon ml-3"
          v-b-tooltip.hover
          v-b-modal="`editApiKeyCommentModal-${keyId}`"
          :title="$t('admin.edit_api_key_comment')"
        >
          <span class="fa fa-edit"></span>
        </b-button>
        <b-button
          v-if="editable"
          size="sm"
          class="action-icon ml-3"
          v-on:click="$emit('regenerateClicked')"
          v-b-tooltip.hover
          :title="$t('admin.regenerate_api_key_title')"
        >
          <span class="fa fa-repeat"></span>
        </b-button>
        <b-button
          size="sm"
          class="action-icon ml-3"
          v-on:click="$emit('removeClicked')"
          v-b-tooltip.hover
          :title="$t('admin.remove_api_key')"
        >
          <span class="fa fa-trash-o"></span>
        </b-button>
      </div>
    </div>
    <edit-api-key-comment-modal
      v-if="editable"
      :key-id="keyId"
      :api-key="apiKey"
    />
    <p class="my-2" :class="{ 'text-muted font-italic': !apiKey.comment }">
      {{ comment }}
    </p>
    <small class="api-key-timestamps text-muted">
      <span v-b-tooltip.hover :title="$t('admin.api_key_created_tooltip')"
        >{{ $t('admin.api_key_created') }}:</span
      >
      <span>{{ createdTimestamp }}</span>
      <span v-b-tooltip.hover :title="$t('admin.api_key_last_used_tooltip')"
        >{{ $t('admin.api_key_last_used') }}:</span
      >
      <span>{{ lastUsedTimestamp }}</span>
      <template v-if="apiKey.expiresAt">
        <span :class="{ 'text-danger': expiryState === 'expired' }"
          >{{ $t('admin.api_key_expires') }}:</span
        >
        <span :class="{ 'text-danger': expiryState === 'expired' }">{{
          expiresTimestamp
        }}</span>
      </template>
    </small>
  </b-list-group-item>
</template>

<script>
import common from '../../../shared/common';
import EditApiKeyCommentModal from './EditApiKeyCommentModal.vue';

const EXPIRY_WARNING_MILLIS = 7 * 24 * 60 * 60 * 1000;

export default {
  props: {
    apiKey: Object,
    editable: { type: Boolean, default: true },
  },
  components: {
    EditApiKeyCommentModal,
  },
  computed: {
    keyId: function () {
      return this.apiKey.publicId;
    },
    comment: function () {
      return this.apiKey.comment
        ? this.apiKey.comment
        : this.$t('admin.api_key_no_comment');
    },
    createdTimestamp: function () {
      return this.apiKey.created
        ? common.formatTimestamp(this.apiKey.created, true)
        : 'N/A';
    },
    lastUsedTimestamp: function () {
      return this.apiKey.lastUsed
        ? common.formatTimestamp(this.apiKey.lastUsed, true)
        : 'N/A';
    },
    expiresTimestamp: function () {
      return common.formatTimestamp(this.apiKey.expiresAt, true);
    },
    expiryState: function () {
      if (!this.apiKey.expiresAt) {
        return null;
      }
      const remainingMillis = this.apiKey.expiresAt - Date.now();
      if (remainingMillis <= 0) {
        return 'expired';
      }
      return remainingMillis <= EXPIRY_WARNING_MILLIS ? 'expiring' : null;
    },
  },
};
</script>

<style lang="scss" scoped>
.text-truncate {
  min-width: 0;
}

.api-key-timestamps {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.5rem;
}

.list-group-item .form-group {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
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

.action-icon .fa-edit {
  color: var(--secondary);
}

.action-icon .fa-repeat {
  color: var(--secondary);
}

.action-icon .fa-trash-o {
  color: var(--danger);
}
</style>
