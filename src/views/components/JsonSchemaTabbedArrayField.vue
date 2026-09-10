<template>
  <div>
    <showdown
      v-if="localizedDescription"
      :markdown="localizedDescription"
      class="form-text text-muted small mb-2 d-block"
    />

    <b-nav v-if="currentValue.length" tabs>
      <b-nav-item
        v-for="(item, index) in currentValue"
        :key="itemKeys[index]"
        :active="activeIndex === index"
        :class="{ 'text-danger': hasItemValidationError(index) }"
        @click="selectTab(index)"
      >
        <i
          v-if="hasItemValidationError(index)"
          class="fa fa-exclamation-circle text-danger mr-1"
          :title="$t('validation.schema.validation_failed')"
          aria-hidden="true"
        ></i>
        {{ itemLabel(item, index) }}
      </b-nav-item>
    </b-nav>

    <div v-if="currentValue.length" class="pt-3">
      <json-schema-object-field
        :schema="itemSchema"
        :property-name="`${propertyName}[${activeIndex}]`"
        :value="activeItem"
        :validation-errors="activeItemValidationErrors"
        @input="onItemChange"
      />
    </div>

    <p v-else class="text-muted mb-2">
      {{ emptyMessage }}
    </p>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <b-button
        variant="outline-primary"
        size="sm"
        :disabled="isMaxItemsReached"
        @click="addItem"
      >
        <i class="fa fa-plus"></i>
        {{ addButtonText }}
      </b-button>

      <b-button
        variant="outline-danger"
        size="sm"
        :disabled="!canRemoveItems"
        :aria-label="removeItemAriaLabel(activeItem, activeIndex)"
        @click="removeItem(activeIndex)"
      >
        <i class="fa fa-trash mr-1" aria-hidden="true"></i>
        {{ removeItemAriaLabel(activeItem, activeIndex) }}
      </b-button>
    </div>

    <small
      v-if="!validationError && (schema.minItems || schema.maxItems)"
      class="form-text text-muted d-block mt-1"
    >
      <span v-if="schema.minItems">
        {{
          $tc('admin.json_schema_form.min_items', schema.minItems, {
            n: schema.minItems,
          })
        }}
      </span>
      <span v-if="schema.maxItems">
        {{
          $tc('admin.json_schema_form.max_items', schema.maxItems, {
            n: schema.maxItems,
          })
        }}
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
  enrichSchema,
  getDefaultValue,
  buildNestedValidationErrorMap,
} from '@/shared/jsonSchemaForm';

let nextItemId = 0;
const nextId = () => {
  nextItemId += 1;
  return nextItemId;
};

export default {
  name: 'JsonSchemaTabbedArrayField',
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
    value: {
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
    labelProperty: {
      type: String,
      default: 'name',
    },
  },
  data() {
    const arr = this.value || [];
    return {
      activeIndex: 0,
      itemKeys: arr.map(() => nextId()),
    };
  },
  computed: {
    currentValue() {
      return this.value || [];
    },
    itemSchema() {
      return this.schema.items || { type: 'object', properties: {} };
    },
    itemProperties() {
      return this.itemSchema.properties || {};
    },
    activeItem() {
      return this.currentValue[this.activeIndex] || {};
    },
    localizedDescription() {
      return (
        this.schema['x-i18n']?.[this.$i18n.locale]?.description ??
        this.schema.description
      );
    },
    itemTitle() {
      return (
        this.itemSchema['x-i18n']?.[this.$i18n.locale]?.title ||
        this.itemSchema.title ||
        this.$t('message.item')
      );
    },
    itemCollectionLabel() {
      const label = String(this.itemTitle).toLowerCase();
      return label.endsWith('s') ? label : `${label}s`;
    },
    addButtonText() {
      return this.$t('message.add_item', { item: this.itemTitle });
    },
    emptyMessage() {
      return this.$t('admin.json_schema_form.no_items_configured', {
        item: this.itemCollectionLabel,
      });
    },
    isMaxItemsReached() {
      return (
        this.schema.maxItems !== undefined &&
        this.currentValue.length >= this.schema.maxItems
      );
    },
    canRemoveItems() {
      return this.currentValue.length > (this.schema.minItems ?? 1);
    },
    nestedErrorMap() {
      return buildNestedValidationErrorMap(this.validationErrors);
    },
    activeItemValidationErrors() {
      return this.nestedErrorMap[this.activeIndex] || {};
    },
    activeNestedErrorMap() {
      return buildNestedValidationErrorMap(this.activeItemValidationErrors);
    },
  },
  watch: {
    value(newValue) {
      const arr = newValue || [];
      if (arr.length !== this.itemKeys.length) {
        this.itemKeys = arr.map(() => nextId());
      }
      this.activeIndex = Math.min(
        this.activeIndex,
        Math.max(0, arr.length - 1),
      );
    },
  },
  methods: {
    enrichSchema,
    selectTab(index) {
      this.activeIndex = index;
    },
    itemLabel(item, index) {
      const label = item?.[this.labelProperty];
      if (typeof label === 'string' && label.trim()) {
        return label;
      }
      return this.$t('admin.json_schema_form.item_number', {
        item: this.itemTitle,
        n: index + 1,
      });
    },
    hasItemValidationError(index) {
      return (
        Object.keys(this.nestedErrorMap[index] || {}).length > 0 ||
        Object.prototype.hasOwnProperty.call(this.validationErrors, index)
      );
    },
    defaultItem() {
      const defaultItem = getDefaultValue(this.itemSchema, { arrayItem: true });
      const item =
        defaultItem && typeof defaultItem === 'object' ? defaultItem : {};

      Object.entries(this.itemProperties).forEach(([propName, propSchema]) => {
        if (item[propName] === undefined) {
          item[propName] = getDefaultValue(propSchema);
        }
      });

      if (this.itemProperties[this.labelProperty]) {
        item[this.labelProperty] = this.uniqueLabel();
      }
      return item;
    },
    uniqueLabel() {
      const labels = new Set(
        this.currentValue
          .map((item) => item?.[this.labelProperty])
          .filter((label) => typeof label === 'string')
          .map((label) => label.trim()),
      );
      let suffix = 1;
      let label = 'new-source';
      while (labels.has(label)) {
        suffix += 1;
        label = `new-source-'${suffix}`;
      }
      return label;
    },
    addItem() {
      if (this.isMaxItemsReached) {
        return;
      }
      const newArray = [...this.currentValue, this.defaultItem()];
      this.itemKeys = [...this.itemKeys, nextId()];
      this.activeIndex = newArray.length - 1;
      this.$emit('input', newArray);
    },
    removeItem(index) {
      if (!this.canRemoveItems) {
        return;
      }
      const newArray = this.currentValue.filter((_, i) => i !== index);
      this.itemKeys = this.itemKeys.filter((_, i) => i !== index);
      if (index < this.activeIndex) {
        this.activeIndex -= 1;
      } else {
        this.activeIndex = Math.min(
          this.activeIndex,
          Math.max(0, newArray.length - 1),
        );
      }
      this.$emit('input', newArray);
    },
    onItemChange(item) {
      const newArray = [...this.currentValue];
      newArray[this.activeIndex] = item;
      this.$emit('input', newArray);
    },
    removeItemAriaLabel(item, index) {
      const label = item?.[this.labelProperty];
      if (typeof label === 'string' && label.trim()) {
        return this.$t('admin.json_schema_form.remove_named_item_aria', {
          name: label,
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
