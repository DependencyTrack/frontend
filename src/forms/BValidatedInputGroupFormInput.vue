<template>
  <validation-provider
    :vid="id"
    :name="label"
    :rules="rules"
    :mode="mode"
    v-slot="{ errors, valid }"
  >
    <b-form-group :id="id" :label="label" :label-for="`${id}-input`">
      <b-input-group :class="inputGroupSize">
        <b-input-group-prepend v-if="icon"
          ><b-input-group-text><i :class="icon"></i></b-input-group-text
        ></b-input-group-prepend>
        <b-form-input
          :id="`${id}-input`"
          :type="type"
          :class="inputClasses"
          v-model="innerValue"
          :placeholder="label"
          :state="errorHandlingMethod(errors, valid)"
          :autocomplete="autocomplete"
          :autofocus="isFocused"
          :required="isRequired"
          v-on="inputListeners"
        />
        <b-input-group-append v-if="tooltip"
          ><b-input-group-text v-b-tooltip.hover :title="tooltip"
            ><i class="cui-info font-lg"></i></b-input-group-text
        ></b-input-group-append>
      </b-input-group>
      <b-form-invalid-feedback :state="errorHandlingMethod(errors, valid)">
        {{ errors[0] }}
      </b-form-invalid-feedback>
    </b-form-group>
  </validation-provider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';
import common from '../shared/common';

export default {
  name: 'BValidatedInputGroupFormInput',
  components: {
    ValidationProvider,
  },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    id: String,
    label: String,
    modelValue: String,
    inputGroupSize: String,
    icon: String,
    rules: String,
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
    };
  },
  beforeMount() {
    if (this.autofocus === true || this.autofocus === 'true') {
      this.isFocused = true;
    }
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
          vm.$emit('update:modelValue', event);
        },
      });
    },
    isRequired: function () {
      return !!(this.rules && this.rules.includes('required'));
    },
    inputClasses: function () {
      let classes = 'form-control';
      if (
        !common.toBoolean(this.lazy) &&
        this.rules &&
        this.rules.includes('required')
      ) {
        classes += ' required';
      }
      return classes;
    },
  },
  methods: {
    errorHandlingMethod: function (errors, valid) {
      if (!this.rules) {
        return null;
      }
      if (common.toBoolean(this.lazy)) {
        return errors[0] ? false : valid ? true : null;
      } else {
        return errors[0] ? false : valid ? true : false;
      }
    },
  },
};
</script>
