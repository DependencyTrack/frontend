<template>
  <b-form-group
    :id="id"
    :label="label"
    :label-for="`${id}-input`"
    :label-class="labelClasses"
  >
    <b-input-group :class="inputGroupSize">
      <template v-if="icon" #prepend
        ><b-input-group-text><i :class="icon"></i></b-input-group-text
      ></template>
      <b-form-input
        :id="`${id}-input`"
        :type="type"
        :class="inputClasses"
        v-model="innerValue"
        :placeholder="label"
        :state="feedbackState()"
        :autocomplete="autocomplete"
        :autofocus="isFocused"
        :required="isRequired"
        :readonly="readonly"
        :disabled="isDisabled"
        v-on="inputListeners"
        v-on:blur="hadFocus = true"
        trim
      />
      <template v-if="tooltip" #append
        ><b-input-group-text v-b-tooltip.hover="tooltip"
          ><i class="cui-info font-lg"></i></b-input-group-text
      ></template>
    </b-input-group>
    <b-form-invalid-feedback
      v-if="this.feedback === 'true'"
      :state="feedbackState()"
    >
      {{ feedbackText }}
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
import common from '../shared/common';

export default {
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    id: String,
    label: String,
    modelValue: String,
    inputGroupSize: String,
    icon: String,
    type: String,
    autocomplete: String,
    autofocus: String,
    tooltip: String,
    feedbackText: String,
    feedback: String,
    lazy: String,
    required: String,
    readonly: Boolean,
    disabled: String,
    state: {
      default: undefined,
      type: Boolean,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isFocused: false,
      isRequired: false,
      isDisabled: false,
      hadFocus: false,
    };
  },
  beforeMount() {
    this.isFocused = common.toBoolean(this.autofocus);
    this.isRequired = common.toBoolean(this.required);
    this.isDisabled = common.toBoolean(this.disabled);
  },
  computed: {
    innerValue: {
      get: function () {
        if (this.modelValue && this.modelValue.length > 0) {
          //
        }
        return this.modelValue;
      },
      set: function (newValue) {
        return newValue;
      },
    },
    inputListeners: function () {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        input: function (event) {
          vm.$emit('update:modelValue', event);
        },
      });
    },
    inputClasses: function () {
      return this.isRequired ? 'required' : null;
    },
    labelClasses: function () {
      return this.isRequired ? 'required' : null;
    },
  },
  methods: {
    feedbackState: function () {
      if (this.isDisabled && !this.isRequired) {
        return undefined;
      }
      if (this.state !== undefined) {
        return this.state;
      }
      if (common.toBoolean(this.lazy) && common.toBoolean(this.required)) {
        if (this.modelValue && this.modelValue.length > 0) {
          return true;
        } else if (this.hadFocus) {
          return false;
        } else {
          return undefined;
        }
      }
      if (this.modelValue && this.modelValue.length > 0) {
        return true;
      } else {
        return undefined;
      }
    },
  },
};
</script>
