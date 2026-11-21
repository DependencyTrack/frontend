<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="!!modelValue?.length"
    :apply-disabled="values.length === 0"
    @show="text = modelValue?.join(', ') ?? ''"
    @apply="apply(values)"
    @clear="apply(null)"
    @dismiss="emit('dismiss')"
  >
    <template #value>= {{ modelValue?.join(', ') }}</template>
    <b-form-input
      v-model="text"
      :aria-label="fieldLabel"
      :placeholder="inputPlaceholder"
      size="sm"
    ></b-form-input>
  </filter-pill-dropdown>
</template>

<script setup>
import { computed, ref, useTemplateRef } from 'vue';
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

defineProps({
  fieldName: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  icon: { type: String, default: null },
  inputPlaceholder: { type: String, default: null },
  modelValue: { type: Array, default: null },
});
const emit = defineEmits(['update:modelValue', 'dismiss']);

const pill = useTemplateRef('pill');
const text = ref('');
const values = computed(() => [
  ...new Set(
    text.value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ),
]);

function apply(value) {
  emit('update:modelValue', value);
  pill.value.hide();
}

defineExpose({ open: () => pill.value.open() });
</script>
