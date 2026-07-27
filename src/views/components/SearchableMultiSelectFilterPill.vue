<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    @show="onDropdownShow"
    @hide="onDropdownHide"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value>= {{ displayValue }}</template>

    <b-form-input
      :id="`searchable-select-filter-pill-search-${fieldName}`"
      ref="searchInput"
      v-model="searchQuery"
      :placeholder="searchPlaceholder || $t('message.search')"
      size="sm"
      class="mb-2"
      :disabled="loading"
    ></b-form-input>
    <div v-if="multiple" class="mb-2 d-flex justify-content-between">
      <b-link size="sm" :disabled="loading" @click="selectFiltered">{{
        $t('message.select_all')
      }}</b-link>
      <b-link size="sm" :disabled="loading" @click="deselectAll">{{
        $t('message.clear_all')
      }}</b-link>
    </div>
    <div class="searchable-select-options mb-2">
      <div v-if="loading" class="text-muted small px-1">
        {{ $t('message.loading') }}
      </div>
      <b-form-radio-group
        v-else-if="!multiple"
        v-model="tmpSingleValue"
        :options="visibleOptions"
        stacked
      ></b-form-radio-group>
      <b-form-checkbox-group
        v-else
        v-model="tmpMultiValue"
        :options="visibleOptions"
        stacked
      ></b-form-checkbox-group>
      <div
        v-if="!loading && visibleOptions.length === 0"
        class="text-muted small px-1"
      >
        {{ $t('message.no_results') }}
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <b-button
        variant="primary"
        size="sm"
        @click="applyFilter"
        :disabled="!canApply || loading"
        >{{ $t('message.apply') }}
      </b-button>
    </div>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'SearchableMultiSelectFilterPill',
  components: { FilterPillDropdown },
  props: {
    fieldName: {
      type: String,
      required: true,
    },
    fieldLabel: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    remoteSearch: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
      default: null,
    },
    modelValue: {
      type: [Array, String],
      default: null,
    },
  },
  emits: ['update:modelValue', 'dismiss', 'search'],
  data() {
    return {
      tmpMultiValue: [],
      tmpSingleValue: null,
      searchQuery: '',
      searchDebounce: null,
    };
  },
  computed: {
    hasFilter() {
      if (this.multiple) {
        return Array.isArray(this.modelValue) && this.modelValue.length > 0;
      }
      return this.modelValue !== null && this.modelValue !== '';
    },
    normalizedOptions() {
      return this.options.map((opt) =>
        typeof opt === 'object' ? opt : { value: opt, text: opt },
      );
    },
    visibleOptions() {
      if (this.remoteSearch) {
        return this.normalizedOptions;
      }
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return this.normalizedOptions;
      }
      return this.normalizedOptions.filter((opt) =>
        String(opt.text).toLowerCase().includes(query),
      );
    },
    displayValue() {
      if (!this.hasFilter) {
        return '';
      }
      if (this.multiple) {
        return this.modelValue
          .map((v) => {
            const option = this.normalizedOptions.find(
              (opt) => opt.value === v,
            );
            return option ? option.text : v;
          })
          .join(', ');
      }
      const option = this.normalizedOptions.find(
        (opt) => opt.value === this.modelValue,
      );
      return option ? option.text : this.modelValue;
    },
    canApply() {
      if (this.multiple) {
        return this.tmpMultiValue.length > 0;
      }
      return !!this.tmpSingleValue;
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        this.syncTmpFromValue(val);
      },
    },
    searchQuery() {
      if (!this.remoteSearch) {
        return;
      }
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.$emit('search', this.searchQuery.trim());
      }, 250);
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchDebounce);
  },
  methods: {
    syncTmpFromValue(val) {
      if (this.multiple) {
        this.tmpMultiValue = val && val.length > 0 ? [...val] : [];
        return;
      }
      this.tmpSingleValue = val || null;
    },
    onDropdownShow() {
      this.syncTmpFromValue(this.modelValue);
      this.searchQuery = '';
      if (this.remoteSearch) {
        this.$emit('search', '');
      }
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },
    selectFiltered() {
      const values = this.visibleOptions.map((opt) => opt.value);
      this.tmpMultiValue = [...new Set([...this.tmpMultiValue, ...values])];
    },
    deselectAll() {
      this.tmpMultiValue = [];
    },
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      this.syncTmpFromValue(this.modelValue);
      this.searchQuery = '';
    },
    applyFilter() {
      if (!this.canApply) {
        return;
      }
      if (this.multiple) {
        this.$emit('update:modelValue', [...this.tmpMultiValue]);
      } else {
        this.$emit('update:modelValue', this.tmpSingleValue);
      }
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpMultiValue = [];
      this.tmpSingleValue = null;
      this.searchQuery = '';
      this.$refs.pill.hide();
      this.$emit('update:modelValue', null);
    },
  },
};
</script>

<style scoped>
.searchable-select-options {
  max-height: 200px;
  overflow-y: auto;
}
</style>
