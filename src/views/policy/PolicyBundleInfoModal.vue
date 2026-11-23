<template>
  <b-modal
    v-model="visible"
    size="lg"
    :title="$t('message.policy_bundle_info')"
  >
    <b-tabs>
      <b-tab active>
        <template v-slot:title
          ><i class="fa fa-edit"></i> {{ $t('message.general') }}</template
        >
        <b-input-group-form-input
          id="bundle-url"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="bundleInfo.url"
          lazy="true"
          feedback="false"
          autofocus="true"
          :label="$t('message.policy_bundle_url')"
          disabled="true"
        />
        <b-input-group-form-input
          id="bundle-hash"
          copyable
          input-group-size="mb-3"
          type="text"
          v-model="bundleInfo.hash"
          lazy="true"
          feedback="false"
          autofocus="false"
          :label="$t('message.policy_bundle_hash')"
          disabled="true"
        />
        <b-input-group-form-input
          id="bundle-created"
          input-group-size="mb-3"
          type="text"
          :modelValue="bundleCreated"
          lazy="true"
          feedback="false"
          autofocus="false"
          :label="$t('message.created')"
          disabled="true"
        />
        <b-input-group-form-input
          id="bundle-last-sync"
          :modelValue="bundleLastSynced"
          feedback="false"
          :label="$t('message.policy_bundle_sync_timestamp')"
          disabled="true"
        />
      </b-tab>
    </b-tabs>
    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '../../forms/BInputGroupFormInput.vue';
import common from '../../shared/common';
import modalMixin from '@/mixins/modalMixin';
export default {
  name: 'PolicyBundleInfoModal',
  mixins: [modalMixin],
  components: {
    BInputGroupFormInput,
  },
  props: {
    bundleInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    bundleCreated() {
      return this.bundleInfo && this.bundleInfo.created != null
        ? common.formatTimestamp(this.bundleInfo.created)
        : '-';
    },
    bundleLastSynced() {
      return this.bundleInfo && this.bundleInfo.last_successful_sync != null
        ? common.formatTimestamp(this.bundleInfo.last_successful_sync, true)
        : '-';
    },
  },
};
</script>

<style scoped>
.card {
  border: 0;
  padding: 0;
  margin-bottom: 0;
}
</style>
