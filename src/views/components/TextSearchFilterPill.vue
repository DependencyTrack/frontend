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
        >~ "{{ value.value }}"</span
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
    value: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      tmpFields: this.allFieldValues(),
      tmpValue: '',
    };
  },
  watch: {
    value: {
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
        this.value &&
        this.value.fields &&
        this.value.fields.length > 0 &&
        this.value.value
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
        this.tmpFields = [...this.value.fields];
        this.tmpValue = this.value.value;
      } else {
        this.tmpFields = this.allFieldValues();
        this.tmpValue = '';
      }
    },
    applyFilter() {
      if (!this.trimmedValue || this.tmpFields.length === 0) return;
      this.$emit('input', {
        fields: [...this.tmpFields],
        value: this.trimmedValue,
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpFields = this.allFieldValues();
      this.tmpValue = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
