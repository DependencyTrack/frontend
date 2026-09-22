<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    :apply-disabled="!trimmedKey"
    @hide="onDropdownHide"
    @apply="applyFilter"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value>{{ value.key }}={{ value.value }}</template>

    <b-input-group size="sm">
      <b-form-input
        :id="`label-filter-pill-key-${fieldName}`"
        v-model="tmpKey"
        :placeholder="$t('message.key')"
        :aria-label="$t('message.key')"
        :maxlength="maxLength"
        size="sm"
      ></b-form-input>
      <b-input-group-append is-text>=</b-input-group-append>
      <b-form-input
        :id="`label-filter-pill-value-${fieldName}`"
        v-model="tmpValue"
        :placeholder="$t('message.value')"
        :aria-label="$t('message.value')"
        :maxlength="maxLength"
        size="sm"
      ></b-form-input>
    </b-input-group>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'LabelFilterPill',
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
      tmpKey: '',
      tmpValue: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val && val.key) {
          this.tmpKey = val.key;
          this.tmpValue = val.value || '';
        } else {
          this.tmpKey = '';
          this.tmpValue = '';
        }
      },
    },
  },
  computed: {
    hasFilter() {
      return !!(this.value && this.value.key);
    },
    trimmedKey() {
      return this.tmpKey ? this.tmpKey.trim() : '';
    },
  },
  methods: {
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.tmpKey = this.value.key;
        this.tmpValue = this.value.value || '';
      } else {
        this.tmpKey = '';
        this.tmpValue = '';
      }
    },
    applyFilter() {
      if (!this.trimmedKey) {
        return;
      }
      this.$emit('input', {
        key: this.trimmedKey,
        value: this.tmpValue ? this.tmpValue.trim() : '',
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpKey = '';
      this.tmpValue = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
