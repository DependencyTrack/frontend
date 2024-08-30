<template>
  <Field
    :vid="id"
    :name="label"
    :rules="rules"
    :mode="mode"
    v-slot="{ errors, valid }"
  >
    <BFormGroup :id="id" :label="label" :label-for="`${id}-input`">
      <BInputGroup :class="inputGroupSize">
        <template #prepend v-if="icon"
          ><BInputGroupText><i :class="icon"></i></BInputGroupText
        ></template>
        <BFormInput
          :id="`${id}-input`"
          :type="type"
          :class="inputClasses"
          v-model="innerValue"
          :placeholder="label"
          :state="errorHandlingMethod(errors, valid)"
          :autocomplete="autocomplete"
          :autofocus="isFocused"
          v-on="inputListeners"
        />
        <template #prepend v-if="tooltip"
          ><BInputGroupText v-b-tooltip.hover :title="tooltip"
            ><i class="cui-info font-lg"></i></BInputGroupText
        ></template>
      </BInputGroup>
      <BFormInvalidFeedback :state="errorHandlingMethod(errors, valid)">
        {{ errors[0] }}
      </BFormInvalidFeedback>
    </BFormGroup>
  </Field>
</template>

<script>
import { Field } from 'vee-validate';
import common from '../shared/common';
import { BFormGroup, BInputGroup, BInputGroupText, BFormInput, BFormInvalidFeedback } from 'bootstrap-vue-next';

export default {
  name: 'BValidatedInputGroupFormInput',
  components: {
    Field,
    BFormGroup,
    BInputGroup,
    BInputGroupText,
    BFormInput,
    BFormInvalidFeedback,
  },
  props: {
    id: String,
    label: String,
    value: String,
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
        return this.value;
      },
      set: function (newValue) {
        return newValue;
      },
    },
    inputListeners: function () {
      const vm = this;

      return Object.assign({}, this.$listeners, {
        input: function (event) {
          vm.$emit('input', event);
        },
      });
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
