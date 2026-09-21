<template>
  <b-modal
    :id="modalId"
    size="md"
    hide-header-close
    no-close-on-backdrop
    :title="$t('admin.new_api_key_title')"
    @show="resetValues"
    @hidden="onHidden"
  >
    <div v-if="key">
      <p class="text-center">{{ $t('admin.new_api_key') }}</p>
      <pre
        class="b-input-group-form-input text-white plaintext"
        style="overflow-x: auto"
        >{{ key }}</pre
      >
    </div>
    <b-form v-else @submit.stop.prevent="createApiKey">
      <b-form-group
        :label="$t('message.comment')"
        :label-for="`${modalId}-comment`"
      >
        <b-form-input
          :id="`${modalId}-comment`"
          v-model="comment"
          type="text"
          trim
        />
      </b-form-group>
      <b-form-group
        :label="$t('admin.api_key_lifetime')"
        :label-for="`${modalId}-lifetime`"
        :description="$t('admin.api_key_lifetime_description')"
      >
        <b-form-select
          :id="`${modalId}-lifetime`"
          v-model="lifetime"
          :options="lifetimeOptions"
        />
      </b-form-group>
      <b-form-group
        v-if="lifetime === 'custom'"
        :label="$t('admin.days')"
        :label-for="`${modalId}-custom-lifetime`"
      >
        <b-form-input
          :id="`${modalId}-custom-lifetime`"
          v-model.number="customDays"
          type="number"
          min="1"
          step="1"
          required
          :state="customDays === null ? null : expiresInDays !== null"
        />
      </b-form-group>
    </b-form>
    <template v-slot:modal-footer="{ cancel }">
      <b-button v-if="key" size="md" variant="primary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <template v-else>
        <b-button size="md" variant="secondary" @click="cancel()">{{
          $t('message.cancel')
        }}</b-button>
        <b-button
          size="md"
          variant="primary"
          :disabled="expiresInDays === null"
          @click="createApiKey"
          >{{ $t('message.create') }}</b-button
        >
      </template>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
  },
  data() {
    return {
      comment: '',
      lifetime: 30,
      customDays: null,
      key: null,
    };
  },
  computed: {
    modalId() {
      return `createServiceAccountApiKeyModal-${this.name}`;
    },
    lifetimeOptions() {
      return [
        ...[7, 30, 90].map((days) => ({
          value: days,
          text: `${days} ${this.$t('admin.days')}`,
        })),
        { value: 'custom', text: this.$t('admin.api_key_lifetime_custom') },
      ];
    },
    expiresInDays() {
      if (this.lifetime !== 'custom') {
        return this.lifetime;
      }
      return Number.isInteger(this.customDays) && this.customDays >= 1
        ? this.customDays
        : null;
    },
  },
  methods: {
    async createApiKey() {
      if (this.expiresInDays === null) {
        return;
      }
      const url = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE_ACCOUNT}/${encodeURIComponent(this.name)}/api-keys`;
      try {
        const response = await this.axios.post(url, {
          comment: this.comment || undefined,
          expires_in_days: this.expiresInDays,
        });
        this.key = response.data.key;
      } catch (error) {
        console.error(error);
      }
    },
    onHidden() {
      if (this.key) {
        this.$emit('created');
      }
      this.key = null;
    },
    resetValues() {
      this.comment = '';
      this.lifetime = 30;
      this.customDays = null;
      this.key = null;
    },
  },
};
</script>
