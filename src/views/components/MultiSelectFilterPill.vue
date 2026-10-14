<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    :apply-disabled="tmpValue.length === 0"
    @hide="onDropdownHide"
    @apply="applyFilter"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value>= {{ displayValue }}</template>

    <div class="filter-pill-actions mb-2">
      <b-link @click="selectAll">{{ $t('message.select_all') }}</b-link>
      <span class="filter-pill-actions-separator" aria-hidden="true">·</span>
      <b-link @click="deselectAll">{{ $t('message.clear_all') }}</b-link>
    </div>
    <div class="filter-pill-list">
      <b-form-checkbox-group
        v-model="tmpValue"
        :options="options"
        :aria-label="fieldLabel"
        stacked
      ></b-form-checkbox-group>
    </div>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'MultiSelectFilterPill',
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
      required: true,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'dismiss'],
  data() {
    return {
      tmpValue: [],
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        this.tmpValue = val && val.length > 0 ? [...val] : [];
      },
    },
  },
  computed: {
    hasFilter() {
      return this.modelValue && this.modelValue.length > 0;
    },
    displayValue() {
      if (!this.modelValue || this.modelValue.length === 0) return '';
      return this.modelValue
        .map((v) => {
          const option = this.options.find(
            (opt) => (typeof opt === 'object' ? opt.value : opt) === v,
          );
          return option && typeof option === 'object' ? option.text : v;
        })
        .join(', ');
    },
  },
  methods: {
    selectAll() {
      this.tmpValue = this.options.map((opt) =>
        typeof opt === 'object' ? opt.value : opt,
      );
    },
    deselectAll() {
      this.tmpValue = [];
    },
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.tmpValue = [...this.modelValue];
      } else {
        this.tmpValue = [];
      }
    },
    applyFilter() {
      if (this.tmpValue.length === 0) {
        return;
      }
      this.$emit('update:modelValue', [...this.tmpValue]);
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpValue = [];
      this.$refs.pill.hide();
      this.$emit('update:modelValue', null);
    },
  },
};
</script>
