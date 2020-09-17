<template>
  <b-row>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ portfolioVulnerabilities }}</h4>
          <p>{{ $t('message.portfolio_vulnerabilities') }}</p>
        </b-card-body>
        <widget-portfolio-vulnerabilities ref="widgetPortfolioVulnerabilities" chartId="card-chart-01" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ vulnerableProjects }}</h4>
          <p>{{ $t('message.projects_at_risk') }}</p>
        </b-card-body>
        <widget-projects-at-risk ref="widgetPortfolioVulnerableProjects" chartId="card-chart-02" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ vulnerableComponents }}</h4>
          <p>{{ $t('message.vulnerable_components') }}</p>
        </b-card-body>
        <widget-vulnerable-components ref="widgetPortfolioVulnerableComponents" chartId="card-chart-03" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ inheritedRiskScore }}</h4>
          <p>{{ $t('message.inherited_risk_score') }}</p>
        </b-card-body>
        <widget-inherited-risk-score ref="widgetPortfolioInheritedRisk" chartId="card-chart-04" class="chart-wrapper px-3" style="height:70px;" :height="70"/>
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
    props: {
      fetch: {
        default: false,
        type: Boolean
      }
    },
    data() {
      return {
        portfolioVulnerabilities: 0,
        vulnerableProjects: 0,
        vulnerableComponents: 0,
        inheritedRiskScore: 0
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
        this.portfolioVulnerabilities = metrics[metrics.length-1].vulnerabilities;
        this.vulnerableProjects = metrics[metrics.length-1].vulnerableProjects;
        this.vulnerableComponents = metrics[metrics.length-1].vulnerableComponents;
        this.inheritedRiskScore = metrics[metrics.length-1].inheritedRiskScore;

        this.$refs.widgetPortfolioVulnerabilities.render(metrics);
        this.$refs.widgetPortfolioVulnerableProjects.render(metrics);
        this.$refs.widgetPortfolioVulnerableComponents.render(metrics);
        this.$refs.widgetPortfolioInheritedRisk.render(metrics);
      }
    }
  }
</script>
