<template>
  <li class="list-group-item">
    <b-button size="sm" class="pull-right action-icon" v-on:click="$emit('actionClicked')" v-b-tooltip.hover :title="tooltip">
      <span class="fa fa-plus-square" v-if="this.addIcon"></span>
      <span class="fa fa-trash-o" v-if="this.deleteIcon"></span>
    </b-button>
    <span>{{ value }}&nbsp;</span>
  </li>
</template>

<script>
  export default {
    props: {
      value: String,
      tooltip: String,
      addIcon: String,
      deleteIcon: String,
      variant: String
    }
  }
</script>

<style lang="scss" scoped>
  .action-icon {
    padding:0;
    margin:0;
    border:0;
    background-color:transparent;
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
</style>
