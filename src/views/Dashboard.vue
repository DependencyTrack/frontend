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
      <chart-portfolio-vulnerabilities chartId="main-chart-01" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-portfolio-vulnerabilities>
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


    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-projects" class="card-title mb-0">{{ $t('message.projects') }}</h4>
        </b-col>
        <b-col sm="7" class="d-none d-md-block">
        </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities chartId="main-chart-01" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-portfolio-vulnerabilities>
    </b-card>


    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-auditing-progress" class="card-title mb-0">{{ $t('message.auditing_progress') }}</h4>
        </b-col>
        <b-col sm="7" class="d-none d-md-block">
        </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities chartId="main-chart-01" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-portfolio-vulnerabilities>
    </b-card>


    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-dependencies" class="card-title mb-0">{{ $t('message.dependencies') }}</h4>
        </b-col>
        <b-col sm="7" class="d-none d-md-block">
        </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities chartId="main-chart-01" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-portfolio-vulnerabilities>
    </b-card>



    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-components" class="card-title mb-0">{{ $t('message.components') }}</h4>
        </b-col>
        <b-col sm="7" class="d-none d-md-block">
        </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities chartId="main-chart-01" class="chart-wrapper" style="height:200px;margin-top:40px;" height="200"></chart-portfolio-vulnerabilities>
    </b-card>

  </div>
</template>

<script>
  import PortfolioWidgetRow from './dashboard/PortfolioWidgetRow'
  import ChartPortfolioVulnerabilities from './dashboard/ChartPortfolioVulnerabilities'
  import { Callout } from '@coreui/vue'

  export default {
    name: 'dashboard',
    components: {
      Callout,
      PortfolioWidgetRow,
      ChartPortfolioVulnerabilities
    }
  }
</script>

<style>
  /* IE fix */
  #card-chart-01, #card-chart-02 {
    width: 100% !important;
  }
</style>
