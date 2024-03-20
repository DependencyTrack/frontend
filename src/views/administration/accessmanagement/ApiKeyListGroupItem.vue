<template>
  <b-list-group-item class="flex-column align-items-start">
    <div class="d-flex w-100 justify-content-between">
      <span class="text-monospace">{{ apiKey.key }}</span>
      <div class="d-flex">
        <b-button
          size="sm"
          class="action-icon"
          v-b-tooltip.hover
          v-b-modal="`editApiKeyCommentModal-${keyId}`"
          :title="$t('admin.edit_api_key_comment')"
        >
          <span class="fa fa-edit"></span>
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
        <edit-api-key-comment-modal
          :key-id="this.keyId"
          :api-key="this.apiKey"
        />
      </div>
    </div>
    <p class="mt-2 font-weight-light">
      <em>{{ comment }}</em>
    </p>
    <hr />
    <div class="d-flex w-100 justify-content-between text-muted">
      <small :title="$t('admin.api_key_created_tooltip')"
        >Created: {{ createdTimestamp }}</small
      >
      <small :title="$t('admin.api_key_last_used_tooltip')"
        >Last Used: {{ lastUsedTimestamp }}</small
      >
    </div>
  </b-list-group-item>
</template>

<script>
import MurmurHash2 from 'imurmurhash';
import common from '../../../shared/common';
import EditApiKeyCommentModal from './EditApiKeyCommentModal.vue';

export default {
  props: {
    apiKey: Object,
    variant: String,
    href: String,
  },
  components: {
    EditApiKeyCommentModal,
  },
  computed: {
    keyId: function () {
      return MurmurHash2(this.apiKey.key).result();
    },
    comment: function () {
      return this.apiKey.comment ? this.apiKey.comment : 'No comment';
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
  },
};
</script>

<style lang="scss" scoped>
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

.action-icon .fa-trash-o {
  color: var(--danger);
}

.list-group-item:last-child {
  margin-bottom: -1px;
}
</style>
