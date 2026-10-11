<template>
  <div class="filter-pill-wrapper">
    <span class="boolean-filter-pill">
      <span class="filter-pill-segment">
        <span
          v-if="icon"
          :class="['fa', icon, 'mr-1']"
          aria-hidden="true"
        ></span>
        {{ fieldLabel }}
      </span>
      <span
        class="filter-pill-segment filter-pill-segment-clear"
        role="button"
        tabindex="0"
        :title="$t('message.clear')"
        :aria-label="$t('message.clear') + ' ' + fieldLabel"
        @click="clearFilter"
        @keydown.enter.stop.prevent="clearFilter"
        @keydown.space.stop.prevent="clearFilter"
      >
        <span class="fa fa-times-circle" aria-hidden="true"></span>
      </span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'BooleanFilterPill',
  model: { prop: 'modelValue', event: 'update:modelValue' },
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
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    clearFilter() {
      this.$emit('update:modelValue', false);
    },
  },
};
</script>

<style scoped src="./filter-pill.css"></style>
