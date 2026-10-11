<template>
  <div class="text-center">
    <b-link
      v-b-modal="`kevAssertionsModal-${index}`"
      :title="$t('message.kev_show_assertions')"
      class="text-danger"
      style="
        border-bottom: 1px dashed currentColor;
        padding-bottom: 3px;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
      "
      ><i class="fa fa-crosshairs" /> {{ $t('message.yes') }}</b-link
    >
    <kev-assertions-modal :source="source" :vuln-id="vulnId" :index="index" />
  </div>
</template>

<script>
import KevAssertionsModal from './KevAssertionsModal.vue';

export default {
  components: { KevAssertionsModal },
  props: {
    source: String,
    vulnId: String,
    index: Number,
  },
};
</script>
