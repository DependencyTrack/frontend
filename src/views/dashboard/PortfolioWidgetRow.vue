<template>
  <b-row>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget-1">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ portfolioVulnerabilities }}</h4>
          <p>{{ $t('message.portfolio_vulnerabilities') }}</p>
        </b-card-body>
        <widget-portfolio-vulnerabilities ref="widgetPortfolioVulnerabilities" chartId="card-chart-01" class="chart-wrapper px-3" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget-2">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ vulnerableProjects }}</h4>
          <p>{{ $t('message.projects_at_risk') }}</p>
        </b-card-body>
        <widget-projects-at-risk ref="widgetPortfolioVulnerableProjects" chartId="card-chart-02" class="chart-wrapper px-3" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget-3">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ vulnerableDependencies }}</h4>
          <p>{{ $t('message.vulnerable_dependencies') }}</p>
        </b-card-body>
        <widget-vulnerable-dependencies ref="widgetPortfolioVulnerableDependencies" chartId="card-chart-03" class="chart-wrapper px-3" :height="70"/>
      </b-card>
    </b-col>
    <b-col sm="6" lg="3">
      <b-card no-body class="bg-widget-4">
        <b-card-body class="pb-0">
          <h4 class="mb-0">{{ inheritedRiskScore }}</h4>
          <p>{{ $t('message.inherited_risk_score') }}</p>
        </b-card-body>
        <widget-inherited-risk-score ref="widgetPortfolioInheritedRisk" chartId="card-chart-04" class="chart-wrapper px-3" :height="70"/>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
  import WidgetPortfolioVulnerabilities from "./WidgetPortfolioVulnerabilities";
  import WidgetProjectsAtRisk from "./WidgetProjectsAtRisk";
  import WidgetVulnerableDependencies from "./WidgetVulnerableDependencies";
  import WidgetInheritedRiskScore from "./WidgetInheritedRiskScore";

  export default {
    components: {
      WidgetPortfolioVulnerabilities,
      WidgetProjectsAtRisk,
      WidgetVulnerableDependencies,
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
        vulnerableDependencies: 0,
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
        this.vulnerableDependencies = metrics[metrics.length-1].vulnerableDependencies;
        this.inheritedRiskScore = metrics[metrics.length-1].inheritedRiskScore;

        this.$refs.widgetPortfolioVulnerabilities.render(metrics);
        this.$refs.widgetPortfolioVulnerableProjects.render(metrics);
        this.$refs.widgetPortfolioVulnerableDependencies.render(metrics);
        this.$refs.widgetPortfolioInheritedRisk.render(metrics);
      }
    }
  }
</script>
