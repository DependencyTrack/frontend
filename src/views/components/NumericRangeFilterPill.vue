<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    :apply-disabled="applyDisabled"
    @hide="onDropdownHide"
    @apply="applyFilter"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value>{{ displayValue }}</template>

    <div
      class="filter-pill-range filter-pill-range-captions"
      aria-hidden="true"
    >
      <span>{{ $t('message.from') }}</span>
      <span class="filter-pill-range-separator" aria-hidden="true">–</span>
      <span>{{ $t('message.to') }}</span>
    </div>
    <div class="filter-pill-range">
      <b-form-input
        :id="`numeric-range-filter-pill-from-${fieldName}`"
        v-model="tmpFrom"
        type="number"
        :min="min"
        :max="tmpTo || max"
        :step="step"
        :state="fromState"
        :aria-label="$t('message.from')"
        :aria-describedby="rangeState === false ? feedbackId : null"
        size="sm"
      ></b-form-input>
      <span class="filter-pill-range-separator" aria-hidden="true">–</span>
      <b-form-input
        :id="`numeric-range-filter-pill-to-${fieldName}`"
        v-model="tmpTo"
        type="number"
        :min="tmpFrom || min"
        :max="max"
        :step="step"
        :state="toState"
        :aria-label="$t('message.to')"
        :aria-describedby="rangeState === false ? feedbackId : null"
        size="sm"
      ></b-form-input>
    </div>
    <b-form-invalid-feedback
      :id="feedbackId"
      :state="rangeState"
      aria-live="polite"
      class="mt-1"
      >{{ rangeError }}</b-form-invalid-feedback
    >
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'NumericRangeFilterPill',
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
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: null,
    },
    step: {
      type: Number,
      default: 0.1,
    },
    value: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      tmpFrom: '',
      tmpTo: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val) {
          this.tmpFrom =
            val.from !== null && val.from !== undefined ? String(val.from) : '';
          this.tmpTo =
            val.to !== null && val.to !== undefined ? String(val.to) : '';
        } else {
          this.tmpFrom = '';
          this.tmpTo = '';
        }
      },
    },
  },
  computed: {
    hasFilter() {
      return this.value && (this.value.from !== null || this.value.to !== null);
    },
    displayValue() {
      if (!this.value) return '';
      const from = this.value.from;
      const to = this.value.to;
      if (from !== null && to !== null) {
        return `${from} – ${to}`;
      } else if (from !== null) {
        return `≥ ${from}`;
      } else if (to !== null) {
        return `≤ ${to}`;
      }
      return '';
    },
    applyDisabled() {
      return (
        (!this.tmpFrom && !this.tmpTo) ||
        this.fromState === false ||
        this.toState === false
      );
    },
    feedbackId() {
      return `numeric-range-filter-pill-feedback-${this.fieldName}`;
    },
    rangeState() {
      return this.fromState === false || this.toState === false ? false : null;
    },
    rangeError() {
      return this.tmpFrom &&
        this.tmpTo &&
        Number(this.tmpFrom) > Number(this.tmpTo)
        ? this.$t('message.filter_range_order_invalid')
        : this.$t('message.filter_value_out_of_range');
    },
    fromState() {
      if (!this.tmpFrom) return null;
      const val = Number(this.tmpFrom);
      if (isNaN(val)) return false;
      if (this.min !== null && val < this.min) return false;
      if (this.max !== null && val > this.max) return false;
      if (this.tmpTo && !isNaN(Number(this.tmpTo)) && val > Number(this.tmpTo))
        return false;
      return true;
    },
    toState() {
      if (!this.tmpTo) return null;
      const val = Number(this.tmpTo);
      if (isNaN(val)) return false;
      if (this.min !== null && val < this.min) return false;
      if (this.max !== null && val > this.max) return false;
      if (
        this.tmpFrom &&
        !isNaN(Number(this.tmpFrom)) &&
        val < Number(this.tmpFrom)
      )
        return false;
      return true;
    },
  },
  methods: {
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.tmpFrom =
          this.value.from !== null && this.value.from !== undefined
            ? String(this.value.from)
            : '';
        this.tmpTo =
          this.value.to !== null && this.value.to !== undefined
            ? String(this.value.to)
            : '';
      } else {
        this.tmpFrom = '';
        this.tmpTo = '';
      }
    },
    applyFilter() {
      if (this.applyDisabled) return;
      this.$emit('input', {
        from: this.tmpFrom ? Number(this.tmpFrom) : null,
        to: this.tmpTo ? Number(this.tmpTo) : null,
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpFrom = '';
      this.tmpTo = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
