<template>
  <li class="list-group-item align-middle">
    <b-button
      size="sm"
      class="pull-right action-icon"
      v-on:click="$emit('actionClicked')"
      v-b-tooltip.hover
      :title="tooltip"
    >
      <span class="fa fa-plus-square" v-if="this.addIcon"></span>
      <span class="fa fa-trash-o" v-if="this.deleteIcon"></span>
    </b-button>
    <slot v-if="$slots && $slots.default && !!$slots.default[0]"></slot>
    <span v-else
      ><a v-if="this.href" :href="href">{{ value }}</a
      ><span v-else>{{ value }}</span
      >&nbsp;</span
    >
  </li>
</template>

<script>
export default {
  props: {
    value: String,
    tooltip: String,
    addIcon: Boolean,
    deleteIcon: Boolean,
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
.list-group-item:last-child {
  margin-bottom: -1px;
}
</style>
