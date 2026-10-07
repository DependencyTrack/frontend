<template>
  <b-tabs content-class="mt-3">
    <b-tab :title="$t('admin.text_placeholders')" active>
      <text-placeholders />
    </b-tab>
  </b-tabs>
</template>

<script>
import TextPlaceholders from './TextPlaceholders.vue';

export default {
  name: 'CustomizationPage',
  components: {
    TextPlaceholders,
  },
};
</script>
