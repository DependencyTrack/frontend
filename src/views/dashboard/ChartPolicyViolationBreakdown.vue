<template>
  <div>
    <div class="progress-group">
      <div class="progress-group-header">
        <i class="fa fa-shield fa-fw progress-group-icon"></i>
        <span class="title">Security Risk</span>
        <span class="ml-auto font-weight-bold">{{ securityCount }} <span class="text-muted small">({{ securityPercent }}%)</span></span>
      </div>
      <div class="progress-group-bars">
        <b-progress height={} class="progress-xs" :value="securityPercent" variant="violation-type"></b-progress>
      </div>
    </div>
    <div class="progress-group">
      <div class="progress-group-header">
        <i class="fa fa-balance-scale fa-fw progress-group-icon"></i>
        <span class="title">License Risk</span>
        <span class="ml-auto font-weight-bold">{{ licenseCount }} <span class="text-muted small">({{ licensePercent }}%)</span></span>
      </div>
      <div class="progress-group-bars">
        <b-progress height={} class="progress-xs" :value="licensePercent" variant="violation-type"></b-progress>
      </div>
    </div>
    <div class="progress-group">
      <div class="progress-group-header">
        <i class="icon-layers fa-fw progress-group-icon"></i>
        <span class="title">Operational Risk</span>
        <span class="ml-auto font-weight-bold">{{ operationalCount }} <span class="text-muted small">({{ operationalPercent }}%)</span></span>
      </div>
      <div class="progress-group-bars">
        <b-progress height={} class="progress-xs" :value="operationalPercent" variant="violation-type"></b-progress>
      </div>
    </div>
  </div>
</template>

<script>
import common from "../../shared/common"

export default {

  data() {
    return {
      securityCount: 0,
      securityPercent: 0,
      licenseCount: 0,
      licensePercent: 0,
      operationalCount: 0,
      operationalPercent: 0
    }
  },
  methods: {
    render: function(metrics) {
      for (let i = 0; i < metrics.length; i++) {
        if (i === metrics.length - 1) {
          const total =metrics[i].policyViolationsTotal;
          this.securityCount = metrics[i].policyViolationsSecurityTotal;
          this.licenseCount = metrics[i].policyViolationsLicenseTotal;
          this.operationalCount = metrics[i].policyViolationsOperationalTotal;
          this.securityPercent = common.calcProgressPercent(total, this.securityCount);
          this.licensePercent = common.calcProgressPercent(total, this.licenseCount);
          this.operationalPercent = common.calcProgressPercent(total, this.operationalCount);
        }
      }
    }
  }
}
</script>
