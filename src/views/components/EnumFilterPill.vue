<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    auto-apply
    @hide="onDropdownHide"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value>= {{ displayValue }}</template>

    <div class="filter-pill-list">
      <b-form-radio-group
        :id="`enum-filter-pill-value-${fieldName}`"
        v-model="tmpValue"
        :options="radioOptions"
        :aria-label="fieldLabel"
        stacked
        @change="applyFilter"
      ></b-form-radio-group>
    </div>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'EnumFilterPill',
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
      validator: (value) => {
        if (!value || value.length === 0) {
          return false;
        }
        return true;
      },
    },
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      tmpValue: null,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.tmpValue = val || null;
      },
    },
  },
  computed: {
    hasFilter() {
      return this.value !== null && this.value !== '';
    },
    displayValue() {
      if (!this.value) return '';
      const option = this.options.find(
        (opt) => (typeof opt === 'object' ? opt.value : opt) === this.value,
      );
      if (option && typeof option === 'object') {
        return option.text;
      }
      return this.value;
    },
    radioOptions() {
      return this.options.map((opt) =>
        typeof opt === 'object' ? opt : { value: opt, text: opt },
      );
    },
  },
  methods: {
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.tmpValue = this.value;
      } else {
        this.tmpValue = null;
      }
    },
    applyFilter(selected) {
      if (!selected) {
        return;
      }

      this.$emit('input', selected);
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpValue = null;
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
