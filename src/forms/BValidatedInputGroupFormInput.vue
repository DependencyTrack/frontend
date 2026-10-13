<template>
  <b-form-group :id="id" :label="label" :label-for="`${id}-input`">
    <b-input-group :class="inputGroupSize">
      <template v-if="icon" #prepend
        ><b-input-group-text><i :class="icon"></i></b-input-group-text
      ></template>
      <b-form-input
        ref="input"
        :id="`${id}-input`"
        :type="type"
        :class="inputClasses"
        v-model="innerValue"
        :placeholder="label"
        :state="state"
        :autocomplete="autocomplete"
        :autofocus="isFocused"
        :required="required"
        :min="min"
        :max="max"
        v-on="inputListeners"
      />
      <template v-if="tooltip" #append
        ><b-input-group-text v-b-tooltip.hover="tooltip"
          ><i class="cui-info font-lg"></i></b-input-group-text
      ></template>
    </b-input-group>
    <b-form-invalid-feedback :state="state">
      {{ dirty ? error : '' }}
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
import common from '../shared/common';

export default {
  name: 'BValidatedInputGroupFormInput',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    id: String,
    label: String,
    modelValue: String,
    inputGroupSize: String,
    icon: String,
    required: Boolean,
    min: [String, Number],
    max: [String, Number],
    customValidity: String,
    mode: String,
    type: String,
    autocomplete: String,
    autofocus: String,
    tooltip: String,
    lazy: String,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isFocused: false,
      dirty: false,
      valid: null,
      error: null,
    };
  },
  beforeMount() {
    if (this.autofocus === true || this.autofocus === 'true') {
      this.isFocused = true;
    }
  },
  mounted() {
    this.validate();
  },
  watch: {
    modelValue() {
      this.$nextTick(this.validate);
    },
    customValidity() {
      this.$nextTick(this.validate);
    },
  },
  computed: {
    innerValue: {
      get: function () {
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
          vm.dirty = true;
          vm.$emit('update:modelValue', event);
        },
      });
    },
    inputClasses: function () {
      let classes = 'form-control';
      if (!common.toBoolean(this.lazy) && this.required) {
        classes += ' required';
      }
      return classes;
    },
    state: function () {
      if (
        this.mode === 'passive' ||
        !(this.required || this.min != null || this.max != null)
      ) {
        return null;
      }
      if (common.toBoolean(this.lazy)) {
        return this.valid ? true : this.dirty ? false : null;
      }
      return this.valid;
    },
  },
  methods: {
    validate: function () {
      const input = this.$refs.input.$el;
      input.setCustomValidity(this.customValidity || '');
      const { validity } = input;
      const field = { _field_: this.label };
      this.valid = validity.valid;
      if (validity.valueMissing) {
        this.error = this.$t('validation.required', field);
      } else if (validity.rangeUnderflow) {
        this.error = this.$t('validation.min_value', {
          ...field,
          min: this.min,
        });
      } else if (validity.rangeOverflow) {
        this.error = this.$t('validation.max_value', {
          ...field,
          max: this.max,
        });
      } else {
        this.error = input.validationMessage;
      }
    },
  },
};
</script>
