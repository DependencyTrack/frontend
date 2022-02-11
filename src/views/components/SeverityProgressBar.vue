<template>
  <span v-if="vulnerabilities === 0" class="progress">
    <b-progress class="table-progress" :max="'0'" show-value>
      <b-progress-bar class="table-progress" value="0"></b-progress-bar>
    </b-progress>
  </span>
  <span v-else class="progress">
    <b-progress class="table-progress" :max="vulnerabilities" show-value>
      <b-progress-bar :value="critical" class="severity-critical-bg"></b-progress-bar>
      <b-progress-bar :value="high" class="severity-high-bg"></b-progress-bar>
      <b-progress-bar :value="medium" class="severity-medium-bg"></b-progress-bar>
      <b-progress-bar :value="low" class="severity-low-bg"></b-progress-bar>
      <b-progress-bar :value="unassigned" class="severity-unassigned-bg"></b-progress-bar>
    </b-progress>
  </span>
</template>

<script>
  export default {
    props: {
      vulnerabilities: Number,
      critical: Number,
      high: Number,
      medium: Number,
      low: Number,
      unassigned: Number
    }
  }
</script>
