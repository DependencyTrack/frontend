<template>
  <validation-provider :vid="id" :name="label" :rules="rules" v-slot="{ errors, valid }">
    <b-form-group :id="id" :label="label" :label-for="`${id}-input`">
      <b-input-group :class="inputGroupSize">
        <b-input-group-prepend v-if="icon"><b-input-group-text><i :class="icon"></i></b-input-group-text></b-input-group-prepend>
        <b-form-input
          :id="`${id}-input`"
          :type="type"
          class="form-control"
          v-model="innerValue"
          :placeholder="label"
          :state="errors[0] ? false : (valid ? true : null)"
          :autocomplete="autocomplete"
          :autofocus=isFocused
          v-on="inputListeners"
        />
      </b-input-group>
      <b-form-invalid-feedback :state="errors[0] ? false : (valid ? true : null)">
        {{ errors[0] }}
      </b-form-invalid-feedback>
    </b-form-group>
  </validation-provider>
</template>

<script>
  import { ValidationProvider } from "vee-validate";

  export default {
    name: 'BValidatedInputGroupFormInput',
    components: {
      ValidationProvider
    },
    props: {
      id: String,
      label: String,
      value: String,
      inputGroupSize: String,
      icon: String,
      rules: String,
      type: String,
      autocomplete: String,
      autofocus: String
    },
    data() {
      return {
        innerValue: this.value,
        isFocused: false
      }
    },
    beforeMount() {
      if (this.autofocus === true || this.autofocus === "true") {
        this.isFocused = true;
      }
    },
    computed: {
      inputListeners: function() {
        const vm = this;

        return Object.assign({},
          this.$listeners,
          {
            input: function(event) {
              vm.$emit('input', event);
            }
          }
        )
      }
    }
  }
</script>
