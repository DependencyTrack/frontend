<template>
  <li class="list-group-item align-middle">
    <span class="hovertext" data-hover="Drag to Prioritize.">
      <span class="drag-handle" style="cursor: move" v-if="this.dragIcon"
        >☰</span
      >
    </span>
    <b-button
      size="sm"
      class="pull-right action-icon"
      v-on:click="$emit('actionClicked')"
      v-b-tooltip.hover
      :title="tooltip"
    >
      <span class="fa fa-plus-square" v-if="this.addIcon"></span>
      <span class="fa fa-trash-o" v-if="this.deleteIcon"></span>
      <span class="hovertext" data-hover="Fetch new available sources.">
        <span class="fa fa-refresh" v-if="this.refresh"></span>
      </span>
    </b-button>
    <slot v-if="$slots && $slots.default && !!$slots.default[0]"></slot>
    <span v-else
      ><a v-if="this.href" :href="href">{{ value }}</a
      ><span v-else>{{ value }}</span
      >&nbsp;</span
    >
    <span
      class="pull-right badge badge badge-primary text-dark"
      v-if="this.priority"
    >
      {{ index + 1 }}
    </span>
  </li>
</template>

<script>
export default {
  props: {
    value: String,
    index: Number,
    tooltip: String,
    addIcon: Boolean,
    deleteIcon: Boolean,
    dragIcon: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Boolean,
      default: false,
    },
    refresh: {
      type: Boolean,
      default: false,
    },
    variant: String,
    href: String,
  },
};
</script>

<style lang="scss" scoped>
.list-group-item .form-group {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}
.action-icon {
  padding: 0;
  margin: 0;
  border: 0;
  background-color: transparent;
}
.action-icon .fa {
  font-size: 1.2rem;
}
.action-icon .fa-plus-square {
  color: var(--primary);
}
.action-icon .fa-trash-o {
  color: var(--danger);
}
.action-icon .fa-refresh {
  color: var(--primary);
}
.list-group-item:last-child {
  margin-bottom: -1px;
}
.drag-handle {
  display: inline-block;
  margin-right: 6px;
}
.hovertext {
  position: relative;
  border-bottom: 1px dotted black;
}
.hovertext:before {
  content: attr(data-hover);
  visibility: hidden;
  opacity: 0;
  width: 140px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 5px 0;
  transition: opacity 1s ease-in-out;

  position: absolute;
  z-index: 1;
  left: 0;
  top: 110%;
}
.hovertext:hover:before {
  opacity: 1;
  visibility: visible;
}
</style>
