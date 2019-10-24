<template>
  <b-row>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-primary">
        <b-card-body class="pb-0">
          <h4 class="mb-0">980</h4>
          <p>{{ $t('message.portfolio_vulnerabilities') }}</p>
        </b-card-body>
        <widget-portfolio-vulnerabilities chartId="card-chart-01" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-info">
        <b-card-body class="pb-0">
          <h4 class="mb-0">15</h4>
          <p>{{ $t('message.projects_at_risk') }}</p>
        </b-card-body>
        <widget-projects-at-risk chartId="card-chart-02" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-warning">
        <b-card-body class="pb-0">
          <h4 class="mb-0">212</h4>
          <p>{{ $t('message.vulnerable_components') }}</p>
        </b-card-body>
        <widget-vulnerable-components chartId="card-chart-03" class="chart-wrapper" style="height:70px;" height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-danger">
        <b-card-body class="pb-0">
          <h4 class="mb-0">12,644</h4>
          <p>{{ $t('message.inherited_risk_score') }}</p>
        </b-card-body>
        <widget-inherited-risk-score chartId="card-chart-04" class="chart-wrapper px-3" style="height:70px;" height="70"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
  import WidgetPortfolioVulnerabilities from "./WidgetPortfolioVulnerabilities";
  import WidgetProjectsAtRisk from "./WidgetProjectsAtRisk";
  import WidgetVulnerableComponents from "./WidgetVulnerableComponents";
  import WidgetInheritedRiskScore from "./WidgetInheritedRiskScore";

  export default {
    components: {
      WidgetPortfolioVulnerabilities,
      WidgetProjectsAtRisk,
      WidgetVulnerableComponents,
      WidgetInheritedRiskScore,
    },
  }
</script>
