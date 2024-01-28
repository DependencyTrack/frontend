<template>
  <b-row>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ policyViolationsTotal }}</h4>
          <p>{{ $t('message.policy_violations') }}</p>
        </b-card-body>
        <widget-policy-violations ref="widgetPolicyViolations" chartId="policy-card-chart-01" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ policyViolationsSecurityTotal }}</h4>
          <p>{{ $t('policy_violation.license') }}</p>
        </b-card-body>
        <widget-policy-violations-license ref="widgetPolicyViolationsLicense" chartId="policy-card-chart-02" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ policyViolationsOperationalTotal }}</h4>
          <p>{{ $t('policy_violation.operational') }}</p>
        </b-card-body>
        <widget-policy-violations-operational ref="widgetPolicyViolationsOperational" chartId="policy-card-chart-03" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ policyViolationsLicenseTotal }}</h4>
          <p>{{ $t('policy_violation.security') }}</p>
        </b-card-body>
        <widget-policy-violations-security ref="widgetPolicyViolationsSecurity" chartId="policy-card-chart-04" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
  import WidgetPolicyViolations from "./WidgetPolicyViolations";
  import WidgetPolicyViolationsLicense from "./WidgetPolicyViolationsLicense";
  import WidgetPolicyViolationsOperational from "./WidgetPolicyViolationsOperational";
  import WidgetPolicyViolationsSecurity from "./WidgetPolicyViolationsSecurity";

  export default {
    components: {
      WidgetPolicyViolations,
      WidgetPolicyViolationsLicense,
      WidgetPolicyViolationsOperational,
      WidgetPolicyViolationsSecurity,
    },
    props: {
      fetch: {
        default: false,
        type: Boolean
      }
    },
    data() {
      return {
        policyViolationsTotal: 0,
        policyViolationsSecurityTotal: 0,
        policyViolationsOperationalTotal: 0,
        policyViolationsLicenseTotal: 0
      }
    },
    beforeMount () {
      if (this.fetch) {
        const daysBack = 90;
        let url = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/portfolio/${daysBack}/days`;
        this.axios.get(url).then((response) => {
          this.render(response.data);
        });
      }
    },
    methods: {
      render: function (metrics) {
        this.policyViolationsTotal = metrics[metrics.length-1].policyViolationsTotal;
        this.policyViolationsSecurityTotal = metrics[metrics.length-1].policyViolationsSecurityTotal;
        this.policyViolationsOperationalTotal = metrics[metrics.length-1].policyViolationsOperationalTotal;
        this.policyViolationsLicenseTotal = metrics[metrics.length-1].policyViolationsLicenseTotal;

        this.$refs.widgetPolicyViolations.render(metrics);
        this.$refs.widgetPolicyViolationsLicense.render(metrics);
        this.$refs.widgetPolicyViolationsOperational.render(metrics);
        this.$refs.widgetPolicyViolationsSecurity.render(metrics);
      }
    }
  }
</script>
