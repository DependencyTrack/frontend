<template>
  <div class="dependency-graph-search d-flex align-items-center gap-2">
    <label for="dependency-graph-search-input" class="visually-hidden">{{
      $t('message.component_search')
    }}</label>
    <multiselect
      v-multiselect-label
      @keydown.esc.stop
      @keydown.up.down="revealHighlightedOption"
      id="dependency-graph-search-input"
      :model-value="searched.size === 1 ? nodes.get([...searched][0]) : null"
      :placeholder="$t('message.component_search')"
      :options="results"
      :searchable="true"
      :internal-search="false"
      :allow-empty="false"
      :show-no-options="false"
      :show-no-results="query.length > 0"
      track-by="uuid"
      select-label=""
      deselect-label=""
      selected-label=""
      @search-change="query = $event"
      @select="$emit('select', $event.uuid)"
    >
      <template #singleLabel="{ option }">
        <span :title="nodeLabel(option)">{{ searchResultLabel(option) }}</span>
      </template>
      <template #option="{ option }">
        <span class="d-block text-wrap text-break">
          {{ option.name }} {{ option.version }}
          <small v-if="option.group" class="d-block text-muted">
            {{ option.group }}
          </small>
        </span>
      </template>
      <template #afterList>
        <li
          v-if="matches.length > results.length"
          class="dependency-graph-search-limit text-muted"
        >
          {{
            $t('message.search_results_limited', {
              shown: results.length,
              total: matches.length,
            })
          }}
        </li>
      </template>
    </multiselect>
    <button
      v-if="clearable"
      type="button"
      class="btn btn-sm btn-outline-secondary"
      :aria-label="$t('message.clear_search')"
      :title="$t('message.clear_search')"
      @click="$emit('select', null)"
    >
      <i class="fa fa-fw fa-times" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import Multiselect from 'vue-multiselect';
import { nodeLabel, searchNodes, searchResultLabel } from './dependencyGraph';

const MAX_RESULTS = 50;

const props = defineProps({
  nodes: { type: Map, required: true },
  searched: { type: Set, required: true },
  clearable: Boolean,
});
defineEmits(['select']);

const query = ref('');
const matches = computed(() => searchNodes(props.nodes, query.value));
const results = computed(() => matches.value.slice(0, MAX_RESULTS));

// vue-multiselect scrolls by index * option-height, which breaks once a long group makes a row taller.
async function revealHighlightedOption({ currentTarget }) {
  await nextTick();
  currentTarget
    .querySelector('.multiselect__option--highlight')
    ?.scrollIntoView({ block: 'nearest' });
}
</script>

<style lang="scss">
.dependency-graph-search {
  flex: 1 1 18rem;
  max-width: 28rem;
}
.dependency-graph-search-limit {
  padding: 0.5rem 0.75rem;
  font-size: var(--bs-body-font-size);
}
</style>
