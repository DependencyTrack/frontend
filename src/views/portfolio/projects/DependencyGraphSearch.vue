<template>
  <div class="dependency-graph-search d-flex align-items-center gap-2">
    <label for="dependency-graph-search-input" class="visually-hidden">{{
      $t('message.component_search')
    }}</label>
    <multiselect
      ref="picker"
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
      :show-no-results="query.length > 0 && !loading"
      :loading="loading"
      track-by="uuid"
      select-label=""
      deselect-label=""
      selected-label=""
      @search-change="query = $event"
      @open="$emit('open')"
      @select="$emit('select', $event.uuid)"
    >
      <template #singleLabel="{ option }">
        <span :title="nodeLabel(option)">{{ searchResultLabel(option) }}</span>
      </template>
      <template #option="{ option }">
        <span class="d-flex align-items-start justify-content-between gap-2">
          <span class="text-wrap text-break">
            {{ option.name }} {{ option.version }}
            <small v-if="option.group" class="d-block text-muted">
              {{ option.group }}
            </small>
          </span>
          <span
            v-if="resultBadges.has(option.uuid)"
            class="dependency-graph-search-vuln badge flex-shrink-0"
            :class="`severity-${resultBadges.get(option.uuid).severityClass}-bg`"
            :title="resultBadges.get(option.uuid).summary"
            aria-hidden="true"
          >
            <i class="fa fa-bug" aria-hidden="true" />
            {{ resultBadges.get(option.uuid).badgeLabel }}
          </span>
          <span v-if="resultBadges.has(option.uuid)" class="visually-hidden"
            >, {{ resultBadges.get(option.uuid).summary }}</span
          >
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
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import Multiselect from 'vue-multiselect';
import {
  formatVulnerabilityBadge,
  formatVulnerabilityBreakdown,
  nodeLabel,
  normalizeSeverity,
  searchNodes,
  searchResultLabel,
} from './dependencyGraph';

const MAX_RESULTS = 50;

const props = defineProps({
  nodes: { type: Map, required: true },
  searched: { type: Set, required: true },
  vulnerabilitiesByComponent: { type: Map, default: () => new Map() },
  clearable: Boolean,
  loading: Boolean,
});
defineEmits(['open', 'select']);
defineExpose({ focus: () => picker.value.activate() });

const { t } = useI18n();
const picker = useTemplateRef('picker');
const query = ref('');
const matches = computed(() => searchNodes(props.nodes, query.value));
const results = computed(() => matches.value.slice(0, MAX_RESULTS));

const resultBadges = computed(() => {
  const badges = new Map();
  if (!props.vulnerabilitiesByComponent?.size) return badges;
  for (const option of results.value) {
    if (option.type !== 'COMPONENT') continue;
    const summary = props.vulnerabilitiesByComponent.get(option.uuid);
    if (!summary?.total) continue;
    const severityClass = normalizeSeverity(
      summary.highestSeverity,
    ).toLowerCase();
    const translateSeverity = (severity) =>
      t(`severity.${severity.toLowerCase()}`);
    const breakdown = formatVulnerabilityBreakdown(summary, translateSeverity);
    const badgeLabel = formatVulnerabilityBadge(
      summary,
      translateSeverity,
      (params) => t('message.dependency_graph_vuln_badge', params),
      (params) => t('message.dependency_graph_vuln_badge_mixed', params),
    );
    badges.set(option.uuid, {
      severityClass,
      badgeLabel,
      summary: t(
        'message.dependency_graph_vulnerabilities_summary',
        { count: summary.total, breakdown },
        summary.total,
      ),
    });
  }
  return badges;
});

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
.dependency-graph-search-vuln {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  line-height: 1.2;
}
</style>
