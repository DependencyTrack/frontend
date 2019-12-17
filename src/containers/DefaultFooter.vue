<template>
  <TheFooter>
    <div>
      <!-- left side here -->
    </div>
    <div class="ml-auto">
      <a href="https://dependencytrack.org/">{{ $dtrack.application }}</a>&nbsp;
      <span class="mr-1">v{{ $dtrack.version }}</span>
    </div>
  </TheFooter>
</template>
<script>
  import { Footer as TheFooter } from '@coreui/vue'
  export default {
    name: 'DefaultFooter',
    components: {
      TheFooter
    },
  }
</script>
<style scoped>
  footer {
    flex: 0 0 24px;
    font-size: 85%;
  }
</style>
