<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="!!modelValue"
    auto-apply
    @show="onShow"
    @hide="onHide"
    @clear="select(null)"
    @dismiss="$emit('dismiss')"
  >
    <template #value
      >= {{ selected ? projectLabel(selected) : modelValue }}</template
    >
    <label :for="inputId" class="visually-hidden">{{ fieldLabel }}</label>
    <multiselect
      v-multiselect-label
      :id="inputId"
      :model-value="selected"
      :options="options"
      :custom-label="projectLabel"
      :placeholder="$t('message.search')"
      :searchable="true"
      :internal-search="false"
      :loading="loading"
      :allow-empty="false"
      track-by="uuid"
      select-label=""
      deselect-label=""
      selected-label=""
      @search-change="onSearchChange"
      @select="select"
    >
      <template #afterList>
        <li
          v-if="total && total.count > options.length"
          class="text-muted small px-2"
        >
          {{
            $t('message.search_results_limited', {
              shown: options.length,
              total:
                total.type === 'AT_LEAST' ? `${total.count}+` : total.count,
            })
          }}
        </li>
      </template>
    </multiselect>
  </filter-pill-dropdown>
</template>

<script setup>
import axios from 'axios';
import { onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';
import Multiselect from 'vue-multiselect';
import api from '@/shared/api.json';
import common from '@/shared/common';
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

const MAX_RESULTS = 15;
const SEARCH_DELAY_MS = 250;

const props = defineProps({
  fieldName: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  icon: { type: String, default: null },
  modelValue: { type: String, default: null },
});
const emit = defineEmits(['update:modelValue', 'dismiss']);

const pill = useTemplateRef('pill');
const inputId = `project-filter-pill-${props.fieldName}`;
const options = ref([]);
const total = ref(null);
const loading = ref(false);
const selected = ref(null);
let latestQuery = null;
let isOpen = false;
let searchTimer = null;

defineExpose({ open: () => pill.value.open() });

const projectLabel = (project) =>
  project.version ? `${project.name} : ${project.version}` : project.name;

function onShow() {
  isOpen = true;
  search('');
}

function onHide() {
  isOpen = false;
  clearTimeout(searchTimer);
}

function onSearchChange(query) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => isOpen && search(query), SEARCH_DELAY_MS);
}

onBeforeUnmount(() => clearTimeout(searchTimer));

async function search(query) {
  latestQuery = query;
  loading.value = true;
  // Options read "name : version", so a typed label searches both.
  const [name, version] = query.split(' : ');
  try {
    const { data } = await axios.get(
      common.setQueryParams(`${api.BASE_URL}/${api.URL_PROJECTS}`, {
        name_contains: name.trim() || undefined,
        version_contains: version?.trim() || undefined,
        limit: MAX_RESULTS,
        sort_by: 'name',
      }),
    );
    if (query !== latestQuery) return;
    options.value = data.items || [];
    total.value = data.total ?? null;
  } catch (err) {
    console.error(`Failed to search projects: ${err}`);
  } finally {
    if (query === latestQuery) loading.value = false;
  }
}

function select(project) {
  selected.value = project;
  emit('update:modelValue', project?.uuid ?? null);
  pill.value.hide();
}

// Resolves the label of a project that only arrived as a UUID, e.g. from the URL.
watch(
  () => props.modelValue,
  async (uuid) => {
    if (!uuid) {
      selected.value = null;
      return;
    }
    if (selected.value?.uuid === uuid) return;
    selected.value = null;
    try {
      const { data } = await axios.get(
        `${api.BASE_URL}/${api.URL_PROJECT}/${uuid}`,
      );
      if (props.modelValue === uuid) selected.value = data;
    } catch (err) {
      console.error(`Failed to load project: ${err}`);
      if (err.response?.status === 404 && props.modelValue === uuid) {
        emit('update:modelValue', null);
      }
    }
  },
  { immediate: true },
);
</script>

<style scoped>
/* The pill's menu scrolls and clips, so the results take up space in it instead of floating over it. */
:deep(.multiselect__content-wrapper) {
  position: static;
}
</style>
