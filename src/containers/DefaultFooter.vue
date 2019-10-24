<template>
  <TheFooter>
    <div>
      <!-- left side here -->
    </div>
    <div class="ml-auto">
      <a href="https://dependencytrack.org/">Dependency-Track</a>&nbsp;
      <span class="mr-1">v3.7.0-SNAPSHOT</span>
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
