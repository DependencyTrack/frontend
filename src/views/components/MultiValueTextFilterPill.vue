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

    <div
      v-if="tmpValue.length"
      class="mb-2 multi-value-text-filter-pill-values"
    >
      <b-badge
        v-for="item in tmpValue"
        :key="item"
        variant="secondary"
        pill
        class="mr-1 mb-1 multi-value-text-filter-pill-badge"
      >
        {{ item }}
        <button
          type="button"
          class="multi-value-text-filter-pill-remove"
          :aria-label="$t('message.close')"
          @mousedown.stop
          @click.stop.prevent="removeValue(item)"
        >
          ×
        </button>
      </b-badge>
    </div>
    <b-form-input
      :id="`multi-value-text-filter-pill-input-${fieldName}`"
      ref="valueInput"
      v-model="inputText"
      :placeholder="inputPlaceholder || $t('message.search')"
      size="sm"
      class="mb-2"
      @keydown.enter.prevent="addValuesFromInput"
    ></b-form-input>
    <div class="d-flex justify-content-end">
      <b-button
        variant="primary"
        size="sm"
        @click="applyFilter"
        :disabled="!canApply"
        >{{ $t('message.apply') }}
      </b-button>
    </div>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

function parseInputText(text) {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export default {
  name: 'MultiValueTextFilterPill',
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
    inputPlaceholder: {
      type: String,
      default: null,
    },
    value: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      tmpValue: [],
      inputText: '',
    };
  },
  computed: {
    hasFilter() {
      return Array.isArray(this.value) && this.value.length > 0;
    },
    displayValue() {
      if (!this.hasFilter) {
        return '';
      }
      return this.value.join(', ');
    },
    canApply() {
      return this.collectValues().length > 0;
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.syncTmpFromValue(val);
      },
    },
  },
  methods: {
    syncTmpFromValue(val) {
      this.tmpValue = val && val.length > 0 ? [...val] : [];
    },
    collectValues() {
      const fromInput = parseInputText(this.inputText);
      return [...new Set([...this.tmpValue, ...fromInput])];
    },
    addValuesFromInput() {
      const parts = parseInputText(this.inputText);
      if (parts.length === 0) {
        return;
      }
      this.tmpValue = [...new Set([...this.tmpValue, ...parts])];
      this.inputText = '';
    },
    removeValue(item) {
      const nextValue = this.tmpValue.filter((value) => value !== item);
      this.tmpValue = nextValue;
      this.$emit('input', nextValue.length > 0 ? nextValue : null);
    },
    onDropdownShow() {
      this.syncTmpFromValue(this.value);
      this.inputText = '';
      this.$nextTick(() => {
        if (this.$refs.valueInput) {
          this.$refs.valueInput.focus();
        }
      });
    },
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      this.syncTmpFromValue(this.value);
      this.inputText = '';
    },
    applyFilter() {
      const values = this.collectValues();
      if (values.length === 0) {
        return;
      }
      this.$emit('input', values);
      this.inputText = '';
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpValue = [];
      this.inputText = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>

<style scoped>
.multi-value-text-filter-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.multi-value-text-filter-pill-remove {
  border: none;
  background: transparent;
  color: inherit;
  line-height: 1;
  padding: 0;
  margin-left: 0.15rem;
  font-size: 1rem;
  opacity: 0.75;
  cursor: pointer;
}

.multi-value-text-filter-pill-remove:hover {
  opacity: 1;
}
</style>
