<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    :apply-disabled="!trimmedValue || tmpFields.length === 0"
    @hide="onDropdownHide"
    @apply="applyFilter"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value
      ><span :title="$t('message.operator_contains')"
        >~ "{{ modelValue.value }}"</span
      ></template
    >

    <b-form-input
      :id="`text-search-filter-pill-value-${fieldName}`"
      v-model="tmpValue"
      :placeholder="$t('message.search') + '...'"
      :aria-label="fieldLabel"
      class="mb-2"
      size="sm"
    ></b-form-input>
    <div class="filter-pill-caption">{{ $t('message.search_in') }}</div>
    <div class="filter-pill-list">
      <b-form-checkbox-group
        v-model="tmpFields"
        :options="fields"
        :aria-label="$t('message.search_in')"
        stacked
      ></b-form-checkbox-group>
    </div>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'TextSearchFilterPill',
  components: { FilterPillDropdown },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  compatConfig: { COMPONENT_V_MODEL: false },
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
    fields: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => null,
    },
  },
  emits: ['update:modelValue', 'dismiss'],
  data() {
    return {
      tmpFields: this.allFieldValues(),
      tmpValue: '',
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val && val.fields && val.value) {
          this.tmpFields = [...val.fields];
          this.tmpValue = val.value;
        } else {
          this.tmpFields = this.allFieldValues();
          this.tmpValue = '';
        }
      },
    },
  },
  computed: {
    hasFilter() {
      return (
        this.modelValue &&
        this.modelValue.fields &&
        this.modelValue.fields.length > 0 &&
        this.modelValue.value
      );
    },
    trimmedValue() {
      return this.tmpValue ? this.tmpValue.trim() : '';
    },
  },
  methods: {
    allFieldValues() {
      return this.fields.map((f) => (typeof f === 'object' ? f.value : f));
    },
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.tmpFields = [...this.modelValue.fields];
        this.tmpValue = this.modelValue.value;
      } else {
        this.tmpFields = this.allFieldValues();
        this.tmpValue = '';
      }
    },
    applyFilter() {
      if (!this.trimmedValue || this.tmpFields.length === 0) return;
      this.$emit('update:modelValue', {
        fields: [...this.tmpFields],
        value: this.trimmedValue,
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpFields = this.allFieldValues();
      this.tmpValue = '';
      this.$refs.pill.hide();
      this.$emit('update:modelValue', null);
    },
  },
};
</script>
