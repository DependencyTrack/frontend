<template>
  <div
    class="dependency-graph-node position-absolute top-0 start-0"
    role="group"
    :aria-label="label"
    :style="{ width: `${NODE_WIDTH}px`, height: `${NODE_HEIGHT}px` }"
    @mouseenter="$emit('hover', true)"
    @mouseleave="$emit('hover', false)"
    @focusin="$emit('hover', true)"
    @focusout="$emit('hover', false)"
  >
    <component
      :is="path ? 'router-link' : 'span'"
      :to="path"
      :title="linkLabel"
      :aria-label="path ? linkLabel : undefined"
      class="dependency-graph-card"
      :class="{ searched, project: node.type === 'PROJECT', direct }"
    >
      <span class="dependency-graph-name text-truncate">
        <i
          class="fa fa-fw text-muted me-1"
          :class="icon"
          aria-hidden="true"
        />{{ node.name }}
      </span>
      <span class="dependency-graph-details text-muted">
        <span class="dependency-graph-version text-truncate">{{
          node.version
        }}</span>
        <span v-if="node.group" class="dependency-graph-group text-truncate">{{
          node.group
        }}</span>
      </span>
    </component>
    <button
      v-if="node.type === 'COMPONENT'"
      type="button"
      class="dependency-graph-focus"
      :class="{ active: focused }"
      :aria-label="$t('message.show_paths_to_component')"
      :aria-pressed="String(focused)"
      :title="$t('message.show_paths_to_component')"
      @click="$emit('focus-on')"
    >
      <i class="fa fa-crosshairs" aria-hidden="true" />
    </button>
    <button
      v-if="expandable && toggleText"
      type="button"
      class="dependency-graph-toggle"
      :aria-expanded="String(expanded)"
      :aria-label="label"
      @click="$emit('toggle')"
    >
      {{ toggleText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  expansionToggleLabel,
  nodeLabel,
  nodeRoute,
} from './dependencyGraph';

const props = defineProps({
  node: { type: Object, required: true },
  visible: { type: Set, required: true },
  expanded: Boolean,
  expandable: Boolean,
  direct: Boolean,
  searched: Boolean,
  focused: Boolean,
});
defineEmits(['focus-on', 'hover', 'toggle']);

const { t } = useI18n();
const label = computed(() => nodeLabel(props.node));
const linkLabel = computed(() =>
  props.direct
    ? t('message.direct_dependency_label', { label: label.value })
    : label.value,
);
const path = computed(() => nodeRoute(props.node));
const icon = computed(
  () =>
    ({ PROJECT: 'fa-sitemap', SERVICE: 'fa-exchange' })[props.node.type] ??
    'fa-cube',
);
const toggleText = computed(() =>
  expansionToggleLabel(
    props.node.direct_dependencies,
    props.expanded,
    props.visible,
  ),
);
</script>

<style lang="scss">
.dependency-graph.hovering
  .dependency-graph-node:not(.related)
  > .dependency-graph-card,
.dependency-graph.hovering
  .dependency-graph-node:not(.related)
  > .dependency-graph-toggle {
  opacity: 0.45;
}
.dependency-graph-focus {
  position: absolute;
  top: 0.25rem;
  right: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  opacity: 0;
  color: var(--dt-icon-subtle);
  font-size: 1rem;
  border: 0;
  background: none;
}
.dependency-graph-node:hover .dependency-graph-focus,
.dependency-graph-focus:focus-visible,
.dependency-graph-focus.active {
  opacity: 1;
}
.dependency-graph-focus:hover,
.dependency-graph-focus.active {
  color: var(--dt-accent);
}
@media (hover: none) {
  .dependency-graph-focus {
    opacity: 1;
  }
}
.dependency-graph-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 1.25rem 0 0.5rem;
  color: var(--dt-text);
  border: 1px solid var(--dt-graph-edge);
  border-radius: var(--bs-border-radius-lg);
  background: var(--dt-surface-card);
}
a.dependency-graph-card:hover {
  border-color: var(--bs-primary);
  color: var(--dt-text-heading);
  text-decoration: none;
}
.dependency-graph-card.direct {
  box-shadow: inset 4px 0 0 var(--dt-accent);
}
.dependency-graph-card.project {
  border-color: var(--dt-accent);
  font-weight: 600;
}
.dependency-graph-card.searched {
  border: 2px solid var(--dt-accent);
  background: color-mix(in srgb, var(--dt-accent) 16%, var(--dt-surface-card));
  color: var(--dt-text-heading);
  font-weight: 600;
}
.dependency-graph-name {
  padding-right: 1.25rem;
}
.dependency-graph-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1.5rem;
  font-size: 0.75rem;
  font-weight: normal;
}
.dependency-graph-version {
  flex-shrink: 0;
  color: var(--dt-text-strong);
  font-size: 0.8125rem;
  font-weight: 600;
  max-width: 50%;
}
.dependency-graph-group {
  min-width: 0;
}
.dependency-graph-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.25rem;
  transform: translate(50%, -50%);
  color: var(--dt-text-strong);
  font-size: 0.75rem;
  line-height: 1;
  border: 1px solid var(--dt-border-control);
  border-radius: var(--bs-border-radius-pill);
  background: var(--dt-surface-raised);
}
.dependency-graph-toggle:hover {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}
</style>
