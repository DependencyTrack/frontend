<template>
  <div>
    <b-link v-b-modal="modalId">{{ text }}</b-link>
    <component :is="modal" v-bind="modalProps" />
  </div>
</template>

<script>
export default {
  props: {
    text: [String, Number],
    modalId: String,
    modal: Object,
    modalProps: Object,
  },
};
</script>
