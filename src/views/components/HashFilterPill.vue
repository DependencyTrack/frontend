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
    <template #value>{{ value.hashType }} = "{{ value.hash }}"</template>

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
    value: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      tmpHashType: null,
      tmpHash: '',
    };
  },
  watch: {
    value: {
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
      return this.value && this.value.hashType && this.value.hash;
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
        this.tmpHashType = this.value.hashType;
        this.tmpHash = this.value.hash;
      } else {
        this.tmpHashType = null;
        this.tmpHash = '';
      }
    },
    applyFilter() {
      if (!this.trimmedHash || !this.tmpHashType) {
        return;
      }

      this.$emit('input', {
        hashType: this.tmpHashType,
        hash: this.trimmedHash,
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpHashType = null;
      this.tmpHash = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
