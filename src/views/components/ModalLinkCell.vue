<template>
  <div>
    <b-link role="button" @click="visible = true">{{ text }}</b-link>
    <component :is="modal" v-model="visible" v-bind="modalProps" />
  </div>
</template>

<script>
export default {
  props: {
    text: [String, Number],
    modal: Object,
    modalProps: Object,
  },
  data() {
    return {
      visible: false,
    };
  },
};
</script>
