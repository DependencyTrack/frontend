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
          :readonly="readonly"
          :disabled="disabled"
          v-b-tooltip.hover="tooltip"
          switch
          v-on="inputListeners"
        />
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import common from '../shared/common';

export default {
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    id: String,
    label: String, // fallback label if labelOn or labelOff not set
    labelOn: String, // if set will be used for "on" state
    labelOff: String, // if set will be used for "off" state
    modelValue: Boolean,
    inputGroupSize: String,
    readonly: Boolean,
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
        return common.toBoolean(newValue);
      },
    },
    inputListeners: function () {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        change: function (event) {
          vm.$emit('update:modelValue', event); // model doesn't update otherwise?
          vm.$emit('change', event);
        },
      });
    },
  },
  methods: {},
};
</script>
<style scoped>
.custom-switch {
  margin-top: calc(0.375rem + 1px);
}
.form-group {
  flex-direction: row-reverse;
}
.form-group :deep(label.col-form-label) {
  padding-left: 0 !important;
}
</style>
