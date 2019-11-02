<template>
  <validation-provider :name="label" :rules="rules" v-slot="{ errors, valid }">
    <b-form-group :id="name" :label="label" :label-for="`${name}-input`">
      <b-input-group :class="inputGroupSize">
        <b-input-group-prepend><b-input-group-text><i :class="icon"></i></b-input-group-text></b-input-group-prepend>
        <b-form-input
          :id="`${name}-input`"
          :type="type"
          class="form-control"
          v-model="value"
          :placeholder="label"
          :state="errors[0] ? false : (valid ? true : null)"
          :autocomplete="autocomplete"
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
      name: String,
      label: String,
      initialValue: String,
      inputGroupSize: String,
      icon: String,
      rules: String,
      type: String,
      autocomplete: String
    },
    data() {
      return {
        value: this.initialValue
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
