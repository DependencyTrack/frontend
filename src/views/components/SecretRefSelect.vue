<template>
  <div>
    <multiselect
      v-multiselect-label
      :id="id"
      v-model="selectedSecret"
      :placeholder="$t('admin.select_secret_placeholder')"
      :options="availableSecrets"
      :multiple="false"
      :searchable="true"
      :loading="isLoading"
      :internal-search="false"
      :close-on-select="true"
      :clear-on-select="false"
      :preserve-search="true"
      :show-no-results="true"
      :max-height="250"
      track-by="name"
      label="name"
      open-direction="bottom"
      select-label=""
      deselect-label=""
      @search-change="onSearchChange"
      @update:modelValue="onInput"
    >
      <template v-slot:singleLabel="{ option }">
        <span>{{ option.name }}</span>
        <i
          v-if="secretNotFound"
          class="fa fa-exclamation-triangle text-danger ms-1"
          :title="$t('admin.secret_not_found')"
        ></i>
      </template>
      <template v-slot:option="{ option }">
        <div class="secret-option">
          <strong>{{ option.name }}</strong>
          <small v-if="option.description" class="text-muted d-block">
            {{ option.description }}
          </small>
        </div>
      </template>
      <template v-slot:noResult>
        {{ $t('admin.no_secrets_found') }}
      </template>
      <template v-slot:noOptions>
        {{ $t('admin.type_to_search_secrets') }}
      </template>
    </multiselect>
    <small v-if="secretNotFound" class="text-danger">
      {{ $t('admin.secret_not_found_message') }}
    </small>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import common from '@/shared/common';

export default {
  name: 'SecretRefSelect',
  components: {
    Multiselect,
  },
  props: {
    id: {
      type: String,
      default: 'secret-ref-select',
    },
    modelValue: {
      type: String,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      availableSecrets: [],
      isLoading: false,
      debounceTimer: null,
      selectedSecret: null,
      secretNotFound: false,
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      async handler(newValue) {
        if (
          newValue &&
          (!this.selectedSecret || this.selectedSecret.name !== newValue)
        ) {
          this.selectedSecret = { name: newValue };
          if (!this.availableSecrets.some((s) => s.name === newValue)) {
            this.availableSecrets.push({ name: newValue });
          }
          await this.verifySecretExists(newValue);
        } else if (!newValue) {
          this.selectedSecret = null;
          this.secretNotFound = false;
        }
      },
    },
  },
  mounted() {
    this.fetchSecrets('');
  },
  beforeUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  },
  methods: {
    onSearchChange(query) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.fetchSecrets(query);
      }, 300);
    },
    async fetchSecrets(searchText) {
      this.isLoading = true;
      try {
        const baseUrl = `${this.$api.BASE_URL}/api/v2/secrets`;
        const params = { limit: '6' };
        if (searchText) {
          params.q = searchText;
        }
        const url = common.setQueryParams(baseUrl, params);
        const response = await this.axios.get(url);
        const secrets = response.data.items || [];
        this.availableSecrets = secrets;
        if (
          this.selectedSecret &&
          !this.availableSecrets.some(
            (s) => s.name === this.selectedSecret.name,
          )
        ) {
          this.availableSecrets.unshift(this.selectedSecret);
        }
      } catch (err) {
        console.error('Failed to fetch secrets:', err);
        this.availableSecrets = [];
      } finally {
        this.isLoading = false;
      }
    },
    async verifySecretExists(secretName) {
      try {
        const url = `${this.$api.BASE_URL}/api/v2/secrets/${encodeURIComponent(secretName)}`;
        const response = await this.axios.get(url, {
          validateStatus: function (status) {
            return status === 200 || status === 404;
          },
        });
        this.secretNotFound = response.status === 404;
      } catch (err) {
        console.error('Failed to verify secret:', err);
        this.secretNotFound = false;
      }
    },
    onInput(selected) {
      const value = selected ? selected.name : null;
      if (selected) {
        this.secretNotFound = false;
      }
      this.$emit('update:modelValue', value);
    },
  },
};
</script>

<style scoped>
.secret-option {
  line-height: 1.4;
}
</style>
