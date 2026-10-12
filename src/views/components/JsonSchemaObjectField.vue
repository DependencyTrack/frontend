<template>
  <b-card no-body class="border">
    <b-card-body>
      <div v-for="(propSchema, propName) in schema.properties" :key="propName">
        <json-schema-form-field
          :schema="enrichSchema(propSchema, propName, schema)"
          :property-name="`${propertyName}.${propName}`"
          :modelValue="currentValue[propName]"
          :validation-error="validationErrors[propName]"
          :validation-errors="nestedErrorMap[propName] || {}"
          @update:modelValue="onPropertyChange(propName, $event)"
        />
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
import JsonSchemaFormField from './JsonSchemaFormField.vue';
import {
  enrichSchema,
  buildNestedValidationErrorMap,
} from '@/shared/jsonSchemaForm';

export default {
  name: 'JsonSchemaObjectField',
  components: {
    JsonSchemaFormField,
  },
  model: { prop: 'modelValue', event: 'update:modelValue' },
  compatConfig: { COMPONENT_V_MODEL: false },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue'],
  computed: {
    currentValue() {
      return this.modelValue || {};
    },
    nestedErrorMap() {
      return buildNestedValidationErrorMap(this.validationErrors);
    },
  },
  methods: {
    enrichSchema,
    onPropertyChange(propName, propValue) {
      this.$emit('update:modelValue', {
        ...this.currentValue,
        [propName]: propValue,
      });
    },
  },
};
</script>
