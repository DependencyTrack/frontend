<template>
  <div class="text-center">
    <b-link
      role="button"
      @click="showKevAssertionsModal = true"
      :title="$t('message.kev_show_assertions')"
      class="text-danger"
      style="
        border-bottom: 1px dashed currentColor;
        padding-bottom: 3px;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
      "
      ><i class="fa fa-crosshairs" /> {{ label ?? $t('message.yes') }}</b-link
    >
    <kev-assertions-modal
      v-model="showKevAssertionsModal"
      :source="source"
      :vuln-id="vulnId"
    />
  </div>
</template>

<script>
import KevAssertionsModal from './KevAssertionsModal.vue';

export default {
  components: { KevAssertionsModal },
  props: {
    source: String,
    vulnId: String,
    label: String,
  },
  data() {
    return {
      showKevAssertionsModal: false,
    };
  },
};
</script>
