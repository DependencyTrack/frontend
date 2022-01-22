<template>
  <span v-if="total === 0" class="progress">
    <b-progress class="table-progress" :max="'0'" show-value>
      <b-progress-bar class="table-progress" value="0"></b-progress-bar>
    </b-progress>
  </span>
  <span v-else class="progress">
    <b-progress class="table-progress" :max="total" show-value>
      <b-progress-bar :value="info" class="severity-info-bg"></b-progress-bar>
      <b-progress-bar :value="warn" class="severity-warn-bg"></b-progress-bar>
      <b-progress-bar :value="fail" class="severity-fail-bg"></b-progress-bar>
    </b-progress>
  </span>
</template>

<script>
  export default {
    props: {
      total: Number,
      info: Number,
      warn: Number,
      fail: Number,
    }
  }
</script>
