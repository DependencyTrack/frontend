<template>
  <b-modal
    id="notification-dialog"
    :title="title"
    hide-header-close
    @ok="confirm"
    @cancel="cancel"
    @hide="cancel"
    ok-only
  >
    <p>{{ message }}</p>
    <template v-slot:modal-footer>
      <b-button @click="confirm" variant="primary">OK</b-button>
      <b-button @click="cancel" variant="primary">Cancel</b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'NotificationDialog',
  props: {
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Notification',
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
