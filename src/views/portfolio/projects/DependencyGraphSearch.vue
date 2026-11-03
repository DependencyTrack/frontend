<template>
  <div class="dependency-graph-search d-flex align-items-center gap-2">
    <label for="dependency-graph-search-input" class="visually-hidden">{{
      $t('message.component_search')
    }}</label>
    <multiselect
      v-multiselect-label
      @keydown.esc.stop
      id="dependency-graph-search-input"
      :model-value="nodes.get([...searched][0]) ?? null"
      :custom-label="nodeLabel"
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
import { computed, ref } from 'vue';
import Multiselect from 'vue-multiselect';
import { nodeLabel, searchNodes } from './dependencyGraph';

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
