<template>
  <div>
    <label class="d-block" v-if="showPlaceholderLabel">&nbsp;</label>
    <b-form-group
      :id="id"
      :label="currentLabel"
      :label-for="`${id}-input`"
      content-cols="auto"
    >
      <b-input-group :class="inputGroupSize">
        <b-form-checkbox
          :id="`${id}-input`"
          v-model="innerValue"
          :disabled="disabled"
          v-b-tooltip.hover="tooltip"
          switch
        />
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import common from '../shared/common';

export default {
  props: {
    id: String,
    label: String, // fallback label if labelOn or labelOff not set
    labelOn: String, // if set will be used for "on" state
    labelOff: String, // if set will be used for "off" state
    modelValue: Boolean,
    inputGroupSize: String,
    disabled: Boolean,
    showPlaceholderLabel: Boolean, // can be used to show an empty label on top, useful to put on same row as other inputs
    tooltip: String,
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      currentLabel:
        (this.modelValue ? this.labelOn : this.labelOff) || this.label,
    };
  },
  computed: {
    innerValue: {
      get: function () {
        return common.toBoolean(this.modelValue);
      },
      set: function (newValue) {
        this.currentLabel =
          (newValue ? this.labelOn : this.labelOff) || this.label;
        this.$emit('update:modelValue', newValue);
        this.$emit('change', newValue);
      },
    },
  },
  methods: {},
};
</script>
<style scoped>
.form-switch {
  margin-top: calc(0.375rem + 1px);
}
/* The gutter of Bootstrap 4's .form-row. */
.b-form-group > :deep(.row) {
  flex-direction: row-reverse;
  --bs-gutter-x: 10px;
}
.b-form-group :deep(label.col-form-label) {
  padding-left: 0 !important;
}
</style>
