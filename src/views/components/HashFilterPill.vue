<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    icon="fa-hashtag"
    :has-filter="hasFilter"
    :apply-disabled="!trimmedHash || !tmpHashType"
    @hide="onDropdownHide"
    @apply="applyFilter"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value
      >{{ modelValue.hashType }} = "{{ modelValue.hash }}"</template
    >

    <b-form-select
      v-model="tmpHashType"
      :options="hashTypeOptions"
      :aria-label="$t('message.hash_type')"
      class="mb-2"
      size="sm"
    ></b-form-select>
    <b-form-input
      v-model="tmpHash"
      :placeholder="$t('message.value')"
      :aria-label="$t('message.value')"
      size="sm"
    ></b-form-input>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'HashFilterPill',
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
    hashTypes: {
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
      tmpHashType: null,
      tmpHash: '',
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val && val.hashType && val.hash) {
          this.tmpHashType = val.hashType;
          this.tmpHash = val.hash;
        } else {
          this.tmpHashType = null;
          this.tmpHash = '';
        }
      },
    },
  },
  computed: {
    hasFilter() {
      return (
        this.modelValue && this.modelValue.hashType && this.modelValue.hash
      );
    },
    trimmedHash() {
      return this.tmpHash ? this.tmpHash.trim() : '';
    },
    hashTypeOptions() {
      return [
        {
          value: null,
          text: `-- ${this.$t('message.hash_type')} --`,
          disabled: true,
        },
        ...this.hashTypes,
      ];
    },
  },
  methods: {
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.tmpHashType = this.modelValue.hashType;
        this.tmpHash = this.modelValue.hash;
      } else {
        this.tmpHashType = null;
        this.tmpHash = '';
      }
    },
    applyFilter() {
      if (!this.trimmedHash || !this.tmpHashType) {
        return;
      }

      this.$emit('update:modelValue', {
        hashType: this.tmpHashType,
        hash: this.trimmedHash,
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpHashType = null;
      this.tmpHash = '';
      this.$refs.pill.hide();
      this.$emit('update:modelValue', null);
    },
  },
};
</script>
