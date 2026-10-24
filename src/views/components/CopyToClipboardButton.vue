<template>
  <b-button
    v-if="supported"
    variant="outline-secondary"
    :size="size"
    :title="name"
    :aria-label="name"
    @click="copy"
  >
    <i class="fa fa-copy" aria-hidden="true"></i>
  </b-button>
</template>

<script>
export default {
  props: {
    value: String,
    label: String,
    size: String,
  },
  computed: {
    name() {
      return this.label
        ? this.$t('message.copy_named', { name: this.label })
        : this.$t('message.copy');
    },
  },
  data() {
    return {
      // NB: clipboard API only exists in secure contexts,
      // i.e. HTTPS or localhost.
      supported: !!navigator.clipboard,
    };
  },
  methods: {
    async copy() {
      try {
        await navigator.clipboard.writeText(this.value);
        this.$toastr.s(this.$t('message.copied_to_clipboard'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
  },
};
</script>
