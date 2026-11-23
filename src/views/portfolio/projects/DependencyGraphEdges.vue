<template>
  <svg
    class="dependency-graph-edges"
    :class="{ dimmed: highlighted.length + outgoing.length > 0 }"
    role="img"
    :aria-label="$t('message.dependency_graph_edges')"
  >
    <g>
      <path :d="allPaths.lines" />
      <path class="dependency-graph-arrows" :d="allPaths.arrows" />
    </g>
    <g class="highlighted">
      <path :d="highlightedPaths.lines" />
      <path class="dependency-graph-arrows" :d="highlightedPaths.arrows" />
    </g>
    <g class="highlighted outgoing">
      <path :d="outgoingPaths.lines" />
      <path class="dependency-graph-arrows" :d="outgoingPaths.arrows" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
import { mergeEdgePaths } from './dependencyGraph';

const props = defineProps({
  edges: { type: Array, required: true },
  highlighted: { type: Array, required: true },
  outgoing: { type: Array, required: true },
});

const allPaths = computed(() => mergeEdgePaths(props.edges));
const highlightedPaths = computed(() => mergeEdgePaths(props.highlighted));
const outgoingPaths = computed(() => mergeEdgePaths(props.outgoing));
</script>

<style lang="scss">
.dependency-graph-edges {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  fill: none;
  stroke: var(--dt-graph-edge);
  // The zoom is a CSS transform outside the SVG, which vector-effect: non-scaling-stroke doesn't account for.
  stroke-width: calc(1px / var(--graph-zoom));
}
.dependency-graph-edges .dependency-graph-arrows {
  fill: var(--dt-graph-edge);
  stroke: none;
}
.dependency-graph-edges.dimmed > g:not(.highlighted) {
  opacity: 0.35;
}
.dependency-graph-edges .highlighted {
  stroke: var(--dt-accent);
  stroke-width: calc(2px / var(--graph-zoom));
}
.dependency-graph-edges .highlighted .dependency-graph-arrows {
  fill: var(--dt-accent);
}
.dependency-graph-edges .outgoing {
  stroke: var(--dt-graph-outgoing);
  stroke-dasharray: calc(6px / var(--graph-zoom)) calc(4px / var(--graph-zoom));
}
.dependency-graph-edges .outgoing .dependency-graph-arrows {
  fill: var(--dt-graph-outgoing);
}
</style>
