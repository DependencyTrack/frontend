<template>
  <li :class="{ leaf: !hasChildren }">
    <div
      class="dependency-graph-row"
      :class="{ pinned }"
      :style="{ '--depth': depth }"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="dependency-graph-toggle"
        :aria-expanded="String(!!node.expand)"
        :aria-label="label"
        @click="$emit('toggle', node)"
      >
        <i
          class="fa fa-fw"
          :class="node.expand ? 'fa-caret-down' : 'fa-caret-right'"
          aria-hidden="true"
        />
      </button>
      <slot :node="node" />
    </div>
    <ul v-if="node.expand && hasChildren">
      <dependency-graph-node
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        @toggle="(n) => $emit('toggle', n)"
      >
        <template #default="slotProps"><slot v-bind="slotProps" /></template>
      </dependency-graph-node>
    </ul>
  </li>
</template>

<script>
const MAX_PINNED_DEPTH = 5;

export default {
  name: 'DependencyGraphNode',
  props: {
    node: Object,
    depth: { type: Number, default: 0 },
  },
  emits: ['toggle'],
  computed: {
    hasChildren() {
      return !!(this.node.children && this.node.children.length);
    },
    label() {
      const name = this.node.group
        ? `${this.node.group}/${this.node.name}`
        : this.node.name;
      return [name, this.node.version].filter(Boolean).join(' ');
    },
    pinned() {
      return (
        this.node.expand && this.hasChildren && this.depth < MAX_PINNED_DEPTH
      );
    },
  },
};
</script>
