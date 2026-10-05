<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    :apply-disabled="!trimmedValue"
    @hide="onDropdownHide"
    @apply="applyFilter"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value
      ><span :title="operatorLabel"
        >{{ operatorAbbrev }} "{{ value.value }}"</span
      ></template
    >

    <b-input-group size="sm">
      <b-input-group-prepend is-text>{{ operatorLabel }}</b-input-group-prepend>
      <b-form-input
        :id="`text-filter-pill-value-${fieldName}`"
        v-model="tmpValue"
        :maxlength="maxLength"
        :aria-label="valueAriaLabel"
        size="sm"
      ></b-form-input>
    </b-input-group>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

const supportedOperators = [
  {
    name: 'equals',
    symbol: '=',
  },
  {
    name: 'contains',
    symbol: '~',
  },
  {
    name: 'starts_with',
    symbol: '^',
  },
];

export default {
  name: 'TextFilterPill',
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
    operator: {
      type: String,
      validator: (value) => {
        if (!supportedOperators.find((op) => op.name === value)) {
          console.error(`Unknown operator ${value}`);
          return false;
        }
        return true;
      },
      default: 'equals',
    },
    maxLength: {
      type: Number,
      default: 255,
    },
    value: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      tmpValue: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.tmpValue = val && val.value ? val.value : '';
      },
    },
  },
  computed: {
    hasFilter() {
      return this.value && this.value.operator && this.value.value;
    },
    trimmedValue() {
      return this.tmpValue ? this.tmpValue.trim() : '';
    },
    operatorAbbrev() {
      const operator = supportedOperators.find(
        (op) => op.name === this.operator,
      );
      return operator ? operator.symbol : '';
    },
    // Keys are spelled out so vue-i18n-extract can see them.
    operatorLabel() {
      return {
        equals: this.$t('message.operator_equals'),
        contains: this.$t('message.operator_contains'),
        starts_with: this.$t('message.operator_starts_with'),
      }[this.operator];
    },
    valueAriaLabel() {
      return `${this.fieldLabel} ${this.operatorLabel}`;
    },
  },
  methods: {
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      this.tmpValue = this.hasFilter ? this.value.value : '';
    },
    applyFilter() {
      if (!this.trimmedValue) {
        return;
      }

      this.$emit('input', {
        operator: this.operator,
        value: this.trimmedValue,
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpValue = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
