<template>
  <div>
    <b-form-group
      v-if="schema.type === 'boolean'"
      :state="isValid ? null : false"
    >
      <b-form-checkbox
        :id="fieldId"
        switch
        :model-value="modelValue"
        :aria-invalid="ariaInvalid"
        :aria-describedby="ariaDescribedBy"
        @update:model-value="onBooleanChange"
      >
        {{ label }}
      </b-form-checkbox>
      <template v-if="description" v-slot:description>
        <markdown :markdown="description" />
      </template>
      <b-form-invalid-feedback :id="feedbackId">
        {{ validationError }}
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      v-else
      :label-for="isArrayItem ? null : fieldId"
      :label-class="showRequiredIndicator ? 'required' : ''"
      :state="isComplexType ? null : isValid ? null : false"
      :class="{ 'mb-0': isArrayItem }"
    >
      <template v-if="!isArrayItem" v-slot:label>
        {{ label }}
        <i
          v-if="isSecretRef"
          v-b-tooltip.hover="$t('admin.secret_reference_field_tooltip')"
          class="fa fa-key text-warning ms-1"
        ></i>
      </template>
      <template
        v-if="!isArrayItem && !isComplexType && description"
        v-slot:description
      >
        <markdown :markdown="description" />
      </template>
      <component
        :is="fieldComponent"
        v-bind="fieldProps"
        :aria-invalid="ariaInvalid"
        :aria-describedby="ariaDescribedBy"
        @update:modelValue="onInput"
      />
      <b-form-invalid-feedback v-if="!isComplexType" :id="feedbackId">
        {{ validationError }}
      </b-form-invalid-feedback>
    </b-form-group>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import {
  BFormInput,
  BFormSelect,
  BFormTextarea,
} from 'bootstrap-vue-next/components';
import Markdown from './Markdown.vue';
import SecretRefSelect from './SecretRefSelect.vue';

const JsonSchemaObjectField = defineAsyncComponent(
  () => import('./JsonSchemaObjectField.vue'),
);
const JsonSchemaArrayField = defineAsyncComponent(
  () => import('./JsonSchemaArrayField.vue'),
);
const JsonSchemaTabbedArrayField = defineAsyncComponent(
  () => import('./JsonSchemaTabbedArrayField.vue'),
);

export default {
  name: 'JsonSchemaFormField',
  components: {
    Markdown,
    SecretRefSelect,
  },
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
      type: [String, Number, Boolean, Array, Object],
      default: null,
    },
    validationError: {
      type: String,
      default: null,
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
    isArrayItem: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    fieldId() {
      return `field-${this.propertyName}`;
    },
    feedbackId() {
      return `${this.fieldId}-feedback`;
    },
    ariaInvalid() {
      if (this.isComplexType) {
        return null;
      }
      return this.validationError ? 'true' : null;
    },
    ariaDescribedBy() {
      if (this.isComplexType) {
        return null;
      }
      return this.validationError ? this.feedbackId : null;
    },
    localizedSchema() {
      const i18n = this.schema['x-i18n']?.[this.$i18n.locale];
      if (!i18n) {
        return this.schema;
      }
      return { ...this.schema, ...i18n };
    },
    label() {
      return this.localizedSchema.title || this.propertyName;
    },
    description() {
      return this.localizedSchema.description;
    },
    isValid() {
      return !this.validationError;
    },
    isComplexType() {
      return this.schema.type === 'array' || this.schema.type === 'object';
    },
    isSecretRef() {
      return this.schema['x-secret-ref'] === true;
    },
    // A boolean always has a value, so a required marker carries no information.
    showRequiredIndicator() {
      return !!this.schema.isRequired && this.schema.type !== 'boolean';
    },
    fieldComponent() {
      if (this.schema.type === 'object') {
        return JsonSchemaObjectField;
      }
      if (this.schema.type === 'array') {
        if (this.isTabbedObjectArray) {
          return JsonSchemaTabbedArrayField;
        }
        return JsonSchemaArrayField;
      }
      if (this.isSecretRef) {
        return 'secret-ref-select';
      }
      if (this.schema.enum) {
        return BFormSelect;
      }
      if (this.schema['x-ui-hint']?.inputType === 'textarea') {
        return BFormTextarea;
      }
      return BFormInput;
    },
    fieldProps() {
      const baseProps = {
        id: this.fieldId,
        state: this.isValid ? null : false,
      };

      if (this.schema.type === 'object') {
        return {
          ...baseProps,
          modelValue: this.modelValue,
          schema: this.schema,
          propertyName: this.propertyName,
          validationErrors: this.validationErrors,
        };
      }

      if (this.schema.type === 'array') {
        const tabbedProps = this.isTabbedObjectArray
          ? { labelProperty: this.schema['x-ui-hint']?.labelProperty || 'name' }
          : {};
        return {
          ...baseProps,
          modelValue: this.modelValue,
          schema: this.schema,
          propertyName: this.propertyName,
          validationErrors: this.validationErrors,
          validationError: this.validationError,
          ...tabbedProps,
        };
      }

      if (this.isSecretRef) {
        return {
          ...baseProps,
          modelValue: this.modelValue,
        };
      }

      if (this.schema.enum) {
        return {
          ...baseProps,
          modelValue: this.modelValue,
          options: this.enumOptions,
          required: !!this.schema.isRequired,
        };
      }

      return {
        ...baseProps,
        modelValue: this.modelValue,
        type: this.getInputType(),
        required: !!this.schema.isRequired,
        placeholder: this.placeholder,
        min: this.schema.minimum,
        max: this.schema.maximum,
        minlength: this.schema.minLength,
        maxlength: this.schema.maxLength,
        pattern: this.schema.pattern,
        readonly: this.schema.readOnly,
        modelModifiers: {
          trim:
            this.schema.type === 'string' && this.schema.format !== 'password',
        },
      };
    },
    isTabbedArray() {
      return (
        this.schema.type === 'array' &&
        this.schema['x-ui-hint']?.layout === 'tabs'
      );
    },
    isTabbedObjectArray() {
      return (
        this.isTabbedArray &&
        (this.schema.items?.type === 'object' ||
          !!this.schema.items?.properties)
      );
    },
    enumOptions() {
      const labels = this.localizedSchema.enumLabels || {};
      return this.schema.enum.map((value) => ({
        value,
        text: labels[value] ?? value,
      }));
    },
    placeholder() {
      const example = this.localizedSchema.examples?.[0];
      return example !== undefined && example !== null ? String(example) : '';
    },
  },
  methods: {
    getInputType() {
      if (this.schema.type === 'number' || this.schema.type === 'integer') {
        return 'number';
      }
      if (this.schema.type === 'string') {
        switch (this.schema.format) {
          case 'email':
            return 'email';
          case 'uri':
          case 'uri-reference':
            return 'url';
          case 'date':
            return 'date';
          case 'date-time':
            return 'datetime-local';
          case 'time':
            return 'time';
          case 'password':
            return 'password';
          default:
            return 'text';
        }
      }
      return 'text';
    },
    onInput(newValue) {
      let processedValue = newValue;
      if (this.schema.type === 'number' || this.schema.type === 'integer') {
        processedValue = newValue === '' ? null : Number(newValue);
      } else if (this.schema.type === 'string' && !this.isArrayItem) {
        processedValue = newValue === '' ? null : newValue;
      }
      this.$emit('update:modelValue', processedValue);
    },
    onBooleanChange(newValue) {
      this.$emit('update:modelValue', !!newValue);
    },
  },
};
</script>
