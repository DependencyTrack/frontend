<template>
  <div>
    <showdown
      v-if="localizedDescription"
      :markdown="localizedDescription"
      class="form-text text-muted small mb-2 d-block"
    />

    <div
      v-for="(item, index) in currentValue"
      :key="itemKeys[index]"
      class="json-schema-array-row mb-2"
    >
      <div class="json-schema-array-row__field">
        <json-schema-form-field
          :schema="itemSchema"
          :property-name="`${propertyName}[${index}]`"
          :modelValue="item"
          :validation-error="validationErrors[index]"
          :validation-errors="nestedErrorMap[index] || {}"
          :is-array-item="true"
          @update:modelValue="onItemChange(index, $event)"
        />
      </div>
      <b-button
        variant="link"
        size="sm"
        class="text-danger json-schema-array-row__remove"
        :aria-label="removeItemAriaLabel(item, index)"
        @click="removeItem(index)"
      >
        <i class="fa fa-trash"></i>
      </b-button>
    </div>

    <b-button
      variant="outline-primary"
      size="sm"
      :disabled="isMaxItemsReached"
      @click="addItem"
    >
      <i class="fa fa-plus"></i>
      {{ addButtonText }}
    </b-button>

    <small
      v-if="!validationError && (schema.minItems || schema.maxItems)"
      class="form-text text-muted d-block mt-1"
    >
      <span v-if="schema.minItems">
        {{ $t('admin.json_schema_form.min_items', schema.minItems) }}
      </span>
      <span v-if="schema.maxItems">
        {{ $t('admin.json_schema_form.max_items', schema.maxItems) }}
      </span>
    </small>

    <div v-if="validationError" class="invalid-feedback d-block">
      {{ validationError }}
    </div>
  </div>
</template>

<script>
import JsonSchemaFormField from './JsonSchemaFormField.vue';
import Showdown from './Showdown.vue';
import {
  getDefaultValue,
  buildNestedValidationErrorMap,
} from '@/shared/jsonSchemaForm';

let nextItemId = 0;
const nextId = () => {
  nextItemId += 1;
  return nextItemId;
};

export default {
  name: 'JsonSchemaArrayField',
  components: {
    JsonSchemaFormField,
    Showdown,
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
      type: Array,
      default: () => [],
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
    validationError: {
      type: String,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  data() {
    const arr = this.modelValue || [];
    return {
      itemKeys: arr.map(() => nextId()),
    };
  },
  computed: {
    currentValue() {
      return this.modelValue || [];
    },
    localizedDescription() {
      return (
        this.schema['x-i18n']?.[this.$i18n.locale]?.description ??
        this.schema.description
      );
    },
    itemSchema() {
      return this.schema.items || { type: 'string' };
    },
    addButtonText() {
      const i18nTitle = this.itemSchema['x-i18n']?.[this.$i18n.locale]?.title;
      const itemName =
        i18nTitle || this.itemSchema.title || this.$t('message.item');
      return this.$t('message.add_item', { item: itemName });
    },
    isMaxItemsReached() {
      return (
        this.schema.maxItems !== undefined &&
        this.currentValue.length >= this.schema.maxItems
      );
    },
    nestedErrorMap() {
      return buildNestedValidationErrorMap(this.validationErrors);
    },
  },
  watch: {
    // Re-seed item keys if the parent replaces the array reference or its
    // length changes in a way the local bookkeeping didn't cause
    // (e.g. reload after save, reset).
    modelValue(newValue) {
      const arr = newValue || [];
      if (arr.length !== this.itemKeys.length) {
        this.itemKeys = arr.map(() => nextId());
      }
    },
  },
  methods: {
    addItem() {
      const defaultValue = getDefaultValue(this.itemSchema, {
        arrayItem: true,
      });
      const newArray = [...this.currentValue, defaultValue];
      this.itemKeys = [...this.itemKeys, nextId()];
      this.$emit('update:modelValue', newArray);
    },
    removeItem(index) {
      const newArray = this.currentValue.filter((_, i) => i !== index);
      this.itemKeys = this.itemKeys.filter((_, i) => i !== index);
      this.$emit('update:modelValue', newArray);
    },
    onItemChange(index, newValue) {
      const newArray = this.currentValue.slice();
      newArray[index] = newValue;
      this.$emit('update:modelValue', newArray);
    },
    removeItemAriaLabel(item, index) {
      if (
        (typeof item === 'string' || typeof item === 'number') &&
        item !== '' &&
        item !== null
      ) {
        return this.$t('admin.json_schema_form.remove_named_item_aria', {
          name: item,
        });
      }
      return this.$t('admin.json_schema_form.remove_item_aria', {
        n: index + 1,
      });
    },
  },
};
</script>

<style scoped>
.json-schema-array-row {
  display: flex;
  align-items: flex-start;
}
.json-schema-array-row__field {
  flex-grow: 1;
  margin-right: 0.5rem;
}
.json-schema-array-row__remove {
  padding: 0.25rem 0.5rem;
}
@media (max-width: 576px) {
  .json-schema-array-row {
    flex-direction: column;
    align-items: stretch;
  }
  .json-schema-array-row__field {
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
  .json-schema-array-row__remove {
    align-self: flex-end;
  }
}
</style>
