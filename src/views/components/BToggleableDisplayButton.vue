<template>
  <b-button :pressed.sync="toggle" :variant="variant" v-on:click="$emit('toggle')"><i :class="iconClass"></i> {{ label }}</b-button>
</template>

<script>
  export default {
    props: {
      variant: String,
      label: String,
    },
    computed: {
      iconClass: function() {
        if (this.toggle === true) {
          return "fa fa-chevron-up";
        } else {
          return "fa fa-chevron-down";
        }
      }
    },
    data() {
      return {
        toggle: false,
      }
    }
  }
</script>
