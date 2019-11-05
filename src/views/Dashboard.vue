<template>
  <div class="animated fadeIn">
    <portfolio-widget-row/>
    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-portfolio-vulns" class="card-title mb-0">{{ $t('message.portfolio_vulnerabilities') }}</h4>
        </b-col>
        <b-col sm="7" class="d-none d-md-block">
        </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities ref="chartPortfolioVulnerabilities" chartId="chartPortfolioVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-portfolio-vulnerabilities>
      <div slot="footer">
        <b-row class="text-center">
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('message.vulnerable_projects') }}</div>
            <strong>29 (40%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="success" :value="40"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0 d-md-down-none">
            <div class="text-muted">{{ $t('message.vulnerable_dependencies') }}</div>
            <strong>100 (20%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="info" :value="20"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('message.vulnerable_components') }}</div>
            <strong>78 (60%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="warning" :value="60"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('message.findings_audited') }}</div>
            <strong>22 (10%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="danger" :value="10"></b-progress>
          </b-col>
        </b-row>
      </div>
    </b-card>

    <b-row>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-projects" class="card-title mb-0">{{ $t('message.projects') }}</h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block">
            </b-col>
          </b-row>
          <chart-project-vulnerabilities ref="chartProjectVulnerabilities" chartId="chartProjectVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-project-vulnerabilities>
        </b-card>
      </b-col>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-auditing-progress" class="card-title mb-0">{{ $t('message.auditing_progress') }}</h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block">
            </b-col>
          </b-row>
          <chart-audited-progress ref="chartAuditedProgress" chartId="chartAuditedProgress" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-audited-progress>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-dependencies" class="card-title mb-0">{{ $t('message.dependencies') }}</h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block">
            </b-col>
          </b-row>
          <chart-dependency-vulnerabilities ref="chartDependencyVulnerabilities" chartId="chartDependencyVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-dependency-vulnerabilities>
        </b-card>
      </b-col>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-components" class="card-title mb-0">{{ $t('message.components') }}</h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block">
            </b-col>
          </b-row>
          <chart-component-vulnerabilities ref="chartComponentVulnerabilities" chartId="chartComponentVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-component-vulnerabilities>
        </b-card>
      </b-col>
    </b-row>

  </div>
</template>

<script>
  import api from "../shared/api";
  import PortfolioWidgetRow from './dashboard/PortfolioWidgetRow'
  import ChartPortfolioVulnerabilities from './dashboard/ChartPortfolioVulnerabilities'
  import ChartProjectVulnerabilities from "./dashboard/ChartProjectVulnerabilities";
  import ChartAuditedProgress from "./dashboard/ChartAuditingProgress";
  import ChartDependencyVulnerabilities from "./dashboard/ChartDependencyVulnerabilities";
  import ChartComponentVulnerabilities from "./dashboard/ChartComponentVulnerabilities";
  import { Callout } from '@coreui/vue'

  export default {
    name: 'dashboard',
    components: {
      Callout,
      PortfolioWidgetRow,
      ChartPortfolioVulnerabilities,
      ChartProjectVulnerabilities,
      ChartAuditedProgress,
      ChartDependencyVulnerabilities,
      ChartComponentVulnerabilities
    },
    mounted () {
      const daysBack = 90;
      let url = `${api.BASE_URL}/${api.URL_METRICS}/portfolio/${daysBack}/days`;
      this.axios.get(url).then((response) => {
        this.$refs.chartPortfolioVulnerabilities.render(response.data);
        this.$refs.chartProjectVulnerabilities.render(response.data);
        this.$refs.chartAuditedProgress.render(response.data);
        this.$refs.chartDependencyVulnerabilities.render(response.data);
        this.$refs.chartComponentVulnerabilities.render(response.data);
      });
    }
  }
</script>

<style>
  /* IE fix */
  #card-chart-01, #card-chart-02 {
    width: 100% !important;
  }
</style>
