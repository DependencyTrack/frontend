<template>
  <b-tabs content-class="mt-3">
    <b-tab :title="$t('admin.source_of_discovery')" active>
      <vulnerability-source />
    </b-tab>
  </b-tabs>
</template>

<script>
import VulnerabilitySource from './VulnerabilitySource.vue';

export default {
  name: 'CustomizationPage',
  components: {
    VulnerabilitySource,
  },
};
</script>
