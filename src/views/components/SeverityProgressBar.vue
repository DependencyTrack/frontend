<template>
  <span v-if="vulnerabilities === 0" class="progress">
    <div class="progress-bar" style="width: 100%">0</div>
  </span>
  <span v-else class="progress">
    <div v-if="critical > 0" class="progress-bar severity-critical-bg" v-bind:style="criticalWidth">{{critical}}</div>
    <div v-if="high > 0" class="progress-bar severity-high-bg" v-bind:style="highWidth">{{high}}</div>
    <div v-if="medium > 0" class="progress-bar severity-medium-bg" v-bind:style="mediumWidth">{{medium}}</div>
    <div v-if="low > 0" class="progress-bar severity-low-bg" v-bind:style="lowWidth">{{low}}</div>
    <div v-if="unassigned > 0" class="progress-bar severity-unassigned-bg" v-bind:style="unassignedWidth">{{unassigned}}</div>
  </span>
</template>

<script>
  export default {
    props: ['vulnerabilities', 'critical', 'high', 'medium', 'low', 'unassigned'],
    computed: {
      criticalWidth: function () {
        return "width:" + (100 * this.critical) / this.vulnerabilities + "%";
      },
      highWidth: function () {
        return "width:" + (100 * this.high) / this.vulnerabilities + "%";
      },
      mediumWidth: function () {
        return "width:" + (100 * this.medium) / this.vulnerabilities + "%";
      },
      lowWidth: function () {
        return "width:" + (100 * this.low) / this.vulnerabilities + "%";
      },
      unassignedWidth: function () {
        return "width:" + (100 * this.unassigned) / this.vulnerabilities + "%";
      }
    }
  }
</script>
