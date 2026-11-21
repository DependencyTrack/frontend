<template>
  <div
    ref="frame"
    class="dependency-graph"
    :class="{ maximized, hovering: hovered && !focused }"
    role="region"
    :aria-label="$t('message.dependency_graph')"
  >
    <div
      class="dependency-graph-toolbar d-flex flex-wrap align-items-center row-gap-2 column-gap-3"
    >
      <dependency-graph-search
        ref="search"
        :nodes="nodes"
        :searched="searched"
        :clearable="searched.size > 0 && !focused"
        :loading="fetching"
        @open="wanted = true"
        @select="navigateToComponent"
      />
      <div class="ms-auto btn-group" role="group">
        <button
          v-for="(control, index) in [
            {
              label: $t('message.zoom_in'),
              icon: 'fa-plus',
              action: () => viewport.zoomIn(zoomTarget()),
              needsLayout: true,
            },
            {
              label: $t('message.zoom_out'),
              icon: 'fa-minus',
              action: () => viewport.zoomOut(),
              needsLayout: true,
            },
            {
              label: $t('message.fit_to_view'),
              icon: 'fa-compress',
              action: () => viewport.fit(revealPoint()),
              needsLayout: true,
            },
            {
              label: maximized
                ? $t('message.collapse_graph')
                : $t('message.expand_graph'),
              icon: maximized ? 'fa-window-restore' : 'fa-window-maximize',
              action: () => (maximized = !maximized),
            },
          ]"
          :key="index"
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :aria-label="control.label"
          :title="control.label"
          :disabled="control.needsLayout && !layout"
          @click="control.action"
        >
          <i class="fa fa-fw" :class="control.icon" aria-hidden="true" />
        </button>
      </div>
    </div>
    <dependency-graph-focus-bar
      v-if="focused"
      v-model:shortest-only="shortestOnly"
      :forced="tooManyPaths || layoutTimedOut"
      :component="nodes.get(focused)"
      :shown="visible.size - 1"
      :total="nodes.size - 1"
      @center="centerOn(focused)"
      @clear="navigateToComponent(null)"
    />
    <p v-if="notFound" class="dependency-graph-message text-muted">
      {{ $t('message.not_found_in_dependency_graph') }}
    </p>
    <p
      v-if="tooManyPaths"
      class="dependency-graph-message text-muted"
      role="status"
    >
      {{
        $t('message.dependency_graph_too_many_paths', {
          count: pathSearch.pathNodes.size - 1,
        })
      }}
    </p>
    <p
      v-if="layoutTimedOut && !layoutFailed"
      class="dependency-graph-message text-muted"
      role="status"
    >
      {{ $t('message.dependency_graph_layout_timed_out') }}
    </p>
    <p v-if="noDependencies" class="dependency-graph-message text-muted">
      {{ $t('message.dependency_graph_no_dependencies') }}
    </p>
    <p v-if="loadFailed" class="dependency-graph-message text-muted">
      {{ $t('message.dependency_graph_load_failed') }}
    </p>
    <p
      v-if="layoutFailed"
      class="dependency-graph-message text-muted"
      role="alert"
    >
      {{ $t('message.dependency_graph_layout_failed') }}
    </p>
    <div class="dependency-graph-canvas">
      <p
        v-if="!route.params.componentUuids && !noDependencies && !loadFailed"
        class="position-absolute top-50 start-50 translate-middle m-0 text-muted text-center"
      >
        {{ $t('message.dependency_graph_search_prompt') }}
      </p>
      <dependency-graph-viewport
        v-if="layout"
        ref="viewport"
        :width="layout.width"
        :height="layout.height"
        @view-change="updateDrawnArea"
      >
        <dependency-graph-edges
          :edges="layout.edges"
          :highlighted="highlightedEdges"
          :outgoing="outgoingEdges"
        />
        <template
          v-for="{ uuid: nodeUuid, x, y } in drawnNodes"
          :key="nodeUuid"
        >
          <dependency-graph-node
            v-if="nodes.has(nodeUuid)"
            :node="nodes.get(nodeUuid)"
            :visible="visible"
            :expanded="expanded.has(nodeUuid)"
            :expandable="expandable.has(nodeUuid)"
            :direct="directUuids.has(nodeUuid)"
            :searched="searched.has(nodeUuid)"
            :focused="nodeUuid === focused"
            :class="{ related: relatedNodes.has(nodeUuid) }"
            :style="{ transform: `translate(${x}px, ${y}px)` }"
            @hover="hover($event ? nodeUuid : null)"
            @focus-on="toggleFocus(nodeUuid)"
            @toggle="toggleExpansion(nodeUuid)"
          />
        </template>
      </dependency-graph-viewport>
      <ul v-if="layout?.edges.length > 0" class="dependency-graph-legend">
        <li>
          <span class="dependency-graph-swatch direct" />
          {{ $t('message.direct_dependency') }}
        </li>
        <li v-if="pathEdges.length > 0">
          <span class="dependency-graph-swatch path" />
          {{ $t('message.dependency_path') }}
        </li>
        <li v-if="incomingEdges.length > 0">
          <span class="dependency-graph-swatch path" />
          {{ $t('message.dependents') }}
        </li>
        <li v-if="outgoingEdges.length > 0">
          <span class="dependency-graph-swatch outgoing" />
          {{ $t('message.dependencies') }}
        </li>
      </ul>
      <div
        v-if="fetching || layouting"
        class="dependency-graph-busy position-absolute d-flex align-items-center gap-2 rounded-3 overflow-hidden"
        role="status"
      >
        <b-spinner small />
        {{ layouting ? $t('message.laying_out_graph') : $t('message.loading') }}
        <span
          v-if="layouting"
          :key="layoutRun"
          class="dependency-graph-time-left"
          :style="{ animationDuration: `${LAYOUT_TIMEOUT_MS}ms` }"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onWatcherCleanup,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/shared/api.json';
import DependencyGraphEdges from './DependencyGraphEdges.vue';
import DependencyGraphFocusBar from './DependencyGraphFocusBar.vue';
import DependencyGraphNode from './DependencyGraphNode.vue';
import DependencyGraphSearch from './DependencyGraphSearch.vue';
import DependencyGraphViewport from './DependencyGraphViewport.vue';
import {
  boundingBox,
  collectReachable,
  collectVisibleEdges,
  collectVisibleNodes,
  findNodesOnPaths,
  findShortestPath,
  nearestNode,
  nextDrawnArea,
  nodeCenter,
  nodesInArea,
} from './dependencyGraph';

// Graphs this small keep every node in the DOM, and so in the tab order.
const MAX_FULLY_DRAWN_NODES = 1000;
// Laying out more takes dagre seconds, and grows much faster than linearly.
const MAX_LAID_OUT_PATH_NODES = 500;
const LAYOUT_TIMEOUT_MS = 15_000;
const REVEAL = Symbol('reveal');

const props = defineProps({
  project: Object,
  uuid: String,
});

const route = useRoute();
const router = useRouter();
const viewport = useTemplateRef('viewport');
const search = useTemplateRef('search');
const frame = useTemplateRef('frame');

const nodes = shallowRef(new Map());
const expanded = shallowRef(new Set());
const searched = shallowRef(new Set());
const layout = shallowRef(null);
const drawnArea = shallowRef(null);
const layouting = ref(false);
const layoutFailed = ref(false);
const layoutTimedOut = ref(false);
const layoutRun = ref(0);
const hovered = ref(null);
const shortestOnly = ref(false);
const maximized = ref(false);
const wanted = ref(false);
const fetching = ref(false);
const loadFailed = ref(false);

let worker;
let layoutTimer;
let afterLayout = null;

const noDependencies = computed(() =>
  nodes.value.has(props.uuid)
    ? nodes.value.get(props.uuid).direct_dependencies.length === 0
    : props.project.uuid === props.uuid && !props.project.directDependencies,
);
const pathSearch = computed(() =>
  findNodesOnPaths(nodes.value, props.uuid, searched.value),
);
const notFound = computed(() => !pathSearch.value.found);
const focused = computed(() =>
  searched.value.size === 1 && !notFound.value ? [...searched.value][0] : null,
);
const tooManyPaths = computed(
  () => pathSearch.value.pathNodes.size > MAX_LAID_OUT_PATH_NODES,
);
const shortestPathsOnly = computed(
  () => shortestOnly.value || tooManyPaths.value || layoutTimedOut.value,
);
const pinnedNodes = computed(() => {
  const { pathNodes } = pathSearch.value;
  if (!shortestPathsOnly.value) return pathNodes;
  return new Set(
    [...searched.value]
      .filter((uuid) => pathNodes.has(uuid))
      .flatMap((uuid) => findShortestPath(nodes.value, props.uuid, uuid)),
  );
});
const visible = computed(() =>
  pinnedNodes.value.size === 0
    ? new Set()
    : collectVisibleNodes(
        nodes.value,
        props.uuid,
        expanded.value,
        pinnedNodes.value,
      ),
);
const expandable = computed(() =>
  collectReachable(
    [...searched.value].filter((uuid) => nodes.value.has(uuid)),
    (uuid) => nodes.value.get(uuid).direct_dependencies,
  ),
);
const directUuids = computed(
  () => new Set(nodes.value.get(props.uuid)?.direct_dependencies),
);
const edgesInView = computed(() =>
  collectVisibleEdges(nodes.value, visible.value),
);
const layoutKey = computed(() =>
  JSON.stringify([[...visible.value], edgesInView.value]),
);
// Keeps a hovered or focused node drawn, as removing it would lose keyboard focus.
const drawnNodes = computed(() => {
  const all = layout.value?.nodes ?? [];
  if (all.length <= MAX_FULLY_DRAWN_NODES) return all;
  return drawnArea.value
    ? nodesInArea(all, drawnArea.value, hovered.value)
    : [];
});
const incomingEdges = computed(() =>
  (layout.value?.edges ?? []).filter(({ to }) => to === hovered.value),
);
const outgoingEdges = computed(() =>
  (layout.value?.edges ?? []).filter(({ from }) => from === hovered.value),
);
const pathEdges = computed(() => {
  // Without other nodes in view, the whole graph is the path.
  if (visible.value.size <= pinnedNodes.value.size) return [];
  const pinned = pinnedNodes.value;
  return (layout.value?.edges ?? []).filter(
    ({ from, to }) => pinned.has(from) && pinned.has(to),
  );
});
// A path edge leaving the hovered node is drawn as one of its dependencies instead, as it can't be both colors.
const highlightedEdges = computed(() => [
  ...pathEdges.value.filter(({ from }) => from !== hovered.value),
  ...incomingEdges.value,
]);
const relatedNodes = computed(
  () =>
    new Set([
      hovered.value,
      ...[
        ...pathEdges.value,
        ...incomingEdges.value,
        ...outgoingEdges.value,
      ].flatMap(({ from, to }) => [from, to]),
    ]),
);

async function loadGraph() {
  if (!wanted.value || props.project.uuid !== props.uuid) return;
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort());
  fetching.value = true;
  let graph;
  try {
    graph = (
      await axios.get(
        `${api.BASE_URL}/api/v2/projects/${props.uuid}/dependency-graph`,
        { signal: controller.signal },
      )
    ).data;
  } catch {
    if (!controller.signal.aborted) {
      fetching.value = false;
      loadFailed.value = true;
      wanted.value = false;
    }
    return;
  }
  // A response that arrived just before the abort still resolves.
  if (controller.signal.aborted) return;
  fetching.value = false;
  loadFailed.value = false;
  nodes.value = new Map(graph.nodes.map((node) => [node.uuid, node]));
  applyRoute();
}

function applyRoute() {
  if (route.params.componentUuids) wanted.value = true;
  if (!nodes.value.has(props.uuid)) return;
  searched.value = new Set(route.params.componentUuids?.split('|'));
  expanded.value = new Set();
  shortestOnly.value = false;
  layoutTimedOut.value = false;
  revealWhenLaidOut();
}

function toggleFocus(uuid) {
  navigateToComponent(uuid === focused.value ? null : uuid);
}

function toggleExpansion(uuid) {
  const next = new Set(expanded.value);
  if (!next.delete(uuid)) {
    next.add(uuid);
  }
  expanded.value = next;
  afterLayout = uuid;
}

function updateDrawnArea(view) {
  drawnArea.value = nextDrawnArea(view, drawnArea.value);
}

function findLayoutNode(from, uuid) {
  return from?.nodes.find((node) => node.uuid === uuid);
}

// Zooming around the middle of the view can end up between nodes, with nothing left to see.
function zoomTarget() {
  const view = viewport.value.visibleContentArea();
  const focusedNode = findLayoutNode(layout.value, focused.value);
  if (focusedNode && nodesInArea([focusedNode], view).length > 0) {
    return nodeCenter(focusedNode);
  }
  return nodeCenter(
    nearestNode(layout.value.nodes, {
      x: (view.left + view.right) / 2,
      y: (view.top + view.bottom) / 2,
    }),
  );
}

function revealPoint() {
  const [firstSearched] = searched.value;
  return nodeCenter(
    findLayoutNode(layout.value, firstSearched) ??
      findLayoutNode(layout.value, props.uuid),
  );
}

function centerOn(uuid) {
  const node = findLayoutNode(layout.value, uuid);
  if (node) viewport.value.centerAtScale(1, nodeCenter(node));
}

function onKeydown(event) {
  if (event.key === 'Escape') maximized.value = false;
}

// Stops at the app shell, as toasts and tooltips render next to it and have to keep working.
function setOutsideInert(inert) {
  for (
    let element = frame.value;
    !element.classList.contains('app-shell');
    element = element.parentElement
  ) {
    for (const sibling of element.parentElement.children) {
      if (sibling !== element) sibling.inert = inert;
    }
  }
}

function navigateToComponent(uuid) {
  // Clearing removes the control that had focus, along with the graph.
  if (!uuid) search.value.focus();
  const path = `/projects/${props.uuid}/dependencyGraph`;
  router.push({ path: uuid ? `${path}/${uuid}` : path });
}

// Without a change to the visible graph, no new layout will trigger this.
async function revealWhenLaidOut() {
  afterLayout = REVEAL;
  await nextTick();
  if (!layouting.value) positionViewport(layout.value);
}

async function applyLayout(data) {
  layouting.value = false;
  const previous = layout.value;
  layout.value = data;
  await nextTick();
  positionViewport(previous);
}

function stopLayout() {
  worker?.terminate();
  clearTimeout(layoutTimer);
}

function giveUpLayout() {
  stopLayout();
  layouting.value = false;
  const key = layoutKey.value;
  layoutTimedOut.value = true;
  expanded.value = new Set();
  if (layoutKey.value === key) {
    layoutFailed.value = true;
    layout.value = null;
  }
}

function computeLayout() {
  layouting.value = true;
  layoutRun.value++;
  worker = new Worker(
    new URL('./dependencyGraphLayout.worker.js', import.meta.url),
    { type: 'module' },
  );
  layoutTimer = setTimeout(giveUpLayout, LAYOUT_TIMEOUT_MS);
  worker.onmessage = ({ data }) => {
    stopLayout();
    applyLayout(data);
  };
  worker.onerror = (error) => {
    error.preventDefault();
    stopLayout();
    layouting.value = false;
    layoutFailed.value = true;
    layout.value = null;
    console.warn('Failed to lay out the dependency graph', error.message);
  };
  worker.postMessage({
    nodes: [...visible.value],
    edges: edgesInView.value,
  });
}

function positionViewport(previous) {
  if (!viewport.value) return;
  const action = afterLayout;
  afterLayout = null;

  const before = findLayoutNode(previous, action);
  const after = findLayoutNode(layout.value, action);
  if (before && after) {
    viewport.value.panBy(before.x - after.x, before.y - after.y);
    const children = new Set(
      expanded.value.has(action)
        ? nodes.value.get(action).direct_dependencies
        : [],
    );
    viewport.value.ensureVisible(
      boundingBox([
        after,
        ...layout.value.nodes.filter(({ uuid }) => children.has(uuid)),
      ]),
    );
  } else if (action) {
    viewport.value.fitOrCenterOn(revealPoint());
  }
  updateDrawnArea(viewport.value.visibleContentArea());
}

function hover(uuid) {
  if (!viewport.value?.dragging) {
    hovered.value = uuid;
  }
}

// Project.vue replaces the project whenever it refetches, which needs no new graph unless the BOM changed.
watch(
  [() => props.project.uuid, () => props.project.lastBomImport, wanted],
  loadGraph,
);
watch(() => route.params.componentUuids, applyRoute, { immediate: true });
watch(maximized, setOutsideInert);
watch(
  () => route.path,
  (path) => {
    if (!path.includes('/dependencyGraph')) maximized.value = false;
  },
);
watch(layoutKey, () => {
  stopLayout();
  layoutFailed.value = false;
  if (visible.value.size > 0) {
    computeLayout();
  } else {
    layouting.value = false;
    layout.value = null;
  }
});
watch(shortestOnly, revealWhenLaidOut);

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  if (maximized.value) setOutsideInert(false);
  stopLayout();
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style lang="scss">
@import 'bootstrap/scss/functions';
@import '@/assets/scss/variables';
@import 'bootstrap/scss/variables';

.dependency-graph {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 20rem);
  min-height: 26rem;
  border: 1px solid var(--dt-border);
  border-radius: var(--bs-border-radius-lg);
}
// Above the sticky sidebar and header, but below modals and toasts.
.dependency-graph.maximized {
  position: fixed;
  inset: 0;
  z-index: $zindex-fixed;
  height: auto;
  border: 0;
  border-radius: 0;
  background: var(--bs-body-bg);
}
.dependency-graph-toolbar {
  position: relative;
  // Keeps the search dropdown above the canvas.
  z-index: 2;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--dt-border);
}
.dependency-graph-legend {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  margin: 0;
  padding: 0.125rem 0.5rem;
  list-style: none;
  pointer-events: none;
  color: var(--dt-text-strong);
  font-size: 0.75rem;
  border-radius: var(--bs-border-radius-sm);
  background: var(--dt-surface-raised);
}
.dependency-graph-swatch {
  display: inline-block;
  width: 1.25rem;
  vertical-align: middle;
}
.dependency-graph-swatch.direct {
  height: 0.75rem;
  border: 1px solid var(--dt-accent);
  border-radius: var(--bs-border-radius-sm);
}
.dependency-graph-swatch.path {
  border-top: 2px solid var(--dt-accent);
}
.dependency-graph-swatch.outgoing {
  border-top: 2px dashed var(--dt-graph-outgoing);
}
.dependency-graph-message {
  margin: 0;
  padding: 0.5rem 0.75rem;
}
.dependency-graph-canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: 0 0 var(--bs-border-radius-lg) var(--bs-border-radius-lg);
  background: var(--dt-surface-recessed);
}
.dependency-graph.maximized .dependency-graph-canvas,
.dependency-graph.maximized .dependency-graph-viewport {
  border-radius: 0;
}
.dependency-graph-busy {
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  color: var(--dt-text-strong);
  border: 1px solid var(--dt-border-control);
  background: var(--dt-surface-raised);
  opacity: 0;
  animation: dependency-graph-busy-delay 0s 0.3s forwards;
}
.dependency-graph-time-left {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--dt-accent);
  transform-origin: left;
  animation: dependency-graph-time-left linear forwards;
}
@keyframes dependency-graph-time-left {
  to {
    transform: scaleX(0);
  }
}
@keyframes dependency-graph-busy-delay {
  to {
    opacity: 1;
  }
}
</style>
