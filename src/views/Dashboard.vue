<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row ref="portfolioWidgetRow" />
    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-portfolio-vulns" class="card-title mb-0">{{ $t('message.portfolio_vulnerabilities') }}</h4>
          <div class="small text-muted">
            {{$t('message.last_measurement')}}: {{lastMeasurement}}<b-link v-permission="'PORTFOLIO_MANAGEMENT'" class="font-weight-bold" style="margin-left:6px" v-on:click="refreshMetrics"><i class="fa fa-refresh"></i></b-link>
          </div>
        </b-col>
        <b-col sm="7" class="d-none d-md-block">
        </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities ref="chartPortfolioVulnerabilities" chartId="chartPortfolioVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" :height="200"></chart-portfolio-vulnerabilities>
      <div slot="footer">
        <b-row class="text-center">
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('message.vulnerable_projects') }}</div>
            <strong>{{vulnerableProjects}} ({{vulnerableProjectPercent}}%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="success" v-bind:value="vulnerableProjectPercent"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0 d-md-down-none">
            <div class="text-muted">{{ $t('message.violations_audited') }}</div>
            <strong>{{auditedViolations}} ({{auditedViolationsPercent}}%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="info" v-bind:value="auditedViolationsPercent"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('message.vulnerable_components') }}</div>
            <strong>{{vulnerableComponents}} ({{vulnerableComponentPercent}}%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="warning" v-bind:value="vulnerableComponentPercent"></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('message.findings_audited') }}</div>
            <strong>{{auditedFindings}} ({{auditedFindingPercent}}%)</strong>
            <b-progress height={} class="progress-xs mt-2" :precision="1" variant="danger" v-bind:value="auditedFindingPercent"></b-progress>
          </b-col>
        </b-row>
      </div>
    </b-card>

    <b-row>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-violations" class="card-title mb-0">{{ $t('message.policy_violations') }}</h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block">
            </b-col>
          </b-row>
          <chart-policy-violations ref="chartPolicyViolations" chartId="chartPolicyViolations" class="chart-wrapper" style="height:200px;margin-top:40px;" :height="200"></chart-policy-violations>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0 d-md-down-none">
                <div class="text-muted">
                  {{ $t("policy_violation.fails") }}
                </div>
                <strong
                  >{{ failViolations }} ({{ failViolationsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2"
                  :precision="1"
                  variant="danger"
                  v-bind:value="failViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t("policy_violation.warns") }}
                </div>
                <strong
                  >{{ warnViolations }} ({{ warnViolationsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2"
                  :precision="1"
                  variant="warning"
                  v-bind:value="warnViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t("policy_violation.infos") }}
                </div>
                <strong
                  >{{ infoViolations }} ({{ infoViolationsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2"
                  :precision="1"
                  variant="info"
                  v-bind:value="infoViolationsPercent"
                ></b-progress>
              </b-col>
            </b-row>
          </div>
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
          <chart-audited-progress ref="chartAuditedProgress" chartId="chartAuditedProgress" class="chart-wrapper" style="height:200px;margin-top:40px;" :height="200"></chart-audited-progress>
        </b-card>
      </b-col>
    </b-row>

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
          <chart-project-vulnerabilities ref="chartProjectVulnerabilities" chartId="chartProjectVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" :height="200"></chart-project-vulnerabilities>
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
          <chart-component-vulnerabilities ref="chartComponentVulnerabilities" chartId="chartComponentVulnerabilities" class="chart-wrapper" style="height:200px;margin-top:40px;" :height="200"></chart-component-vulnerabilities>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col md="12">
        <b-card v-bind:header="$t('message.portfolio_statistics')">
          <b-row>
            <b-col sm="12" lg="6">
              <b-row>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{ $t('message.projects') }}</small><br>
                    <strong class="h4">{{totalProjects}}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{ $t('message.components') }}</small><br>
                    <strong class="h4">{{totalComponents}}</strong>
                  </Callout>
                </b-col>
              </b-row>
            </b-col>
            <b-col sm="12" lg="6">
              <b-row>
                <b-col sm="6">
                  <Callout variant="danger">
                    <small class="text-muted">{{ $t('message.policy_violations') }}</small><br>
                    <strong class="h4">{{totalViolations}}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{ $t('message.suppressed') }}</small><br>
                    <strong class="h4">{{suppressed}}</strong>
                  </Callout>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>

  </div>
</template>

<script>
  import common from "../shared/common"
  import PortfolioWidgetRow from './dashboard/PortfolioWidgetRow'
  import ChartPortfolioVulnerabilities from './dashboard/ChartPortfolioVulnerabilities'
  import ChartProjectVulnerabilities from "./dashboard/ChartProjectVulnerabilities";
  import ChartAuditedProgress from "./dashboard/ChartAuditingProgress";
  import ChartPolicyViolations from "./dashboard/ChartPolicyViolations";
  import ChartComponentVulnerabilities from "./dashboard/ChartComponentVulnerabilities";
  import { Callout } from '@coreui/vue'
  import permissionsMixin from "../mixins/permissionsMixin";

  export default {
    name: 'dashboard',
    mixins: [permissionsMixin],
    components: {
      Callout,
      PortfolioWidgetRow,
      ChartPortfolioVulnerabilities,
      ChartProjectVulnerabilities,
      ChartAuditedProgress,
      ChartPolicyViolations,
      ChartComponentVulnerabilities
    },
    data() {
      return {
        totalProjects: 0,
        vulnerableProjects: 0,
        vulnerableProjectPercent: 0,

        totalComponents: 0,
        vulnerableComponents: 0,
        vulnerableComponentPercent: 0,

        totalFindings: 0,
        auditedFindings: 0,
        auditedFindingPercent: 0,

        totalViolations: 0,
        auditedViolations: 0,
        auditedViolationsPercent: 0,
        failViolations: 0,
        failViolationsPercent: 0,
        warnViolations: 0,
        warnViolationsPercent: 0,
        infoViolations: 0,
        infoViolationsPercent: 0,

        vulnerabilities: 0,
        suppressed: 0,
        lastMeasurement: ""
      }
    },
    methods: {
      extractStats(metrics) {
        if (!metrics || metrics.length === 0) {
          return;
        }
        let metric = metrics[metrics.length - 1]; //Use the most recent metric
        this.totalProjects = common.valueWithDefault(metric.projects, "0");
        this.vulnerableProjects = common.valueWithDefault(metric.vulnerableProjects, "0");
        this.vulnerableProjectPercent = common.calcProgressPercent(this.totalProjects, this.vulnerableProjects);

        this.totalComponents = common.valueWithDefault(metric.components, "0");
        this.vulnerableComponents = common.valueWithDefault(metric.vulnerableComponents, "0");
        this.vulnerableComponentPercent = common.calcProgressPercent(this.totalComponents, this.vulnerableComponents);

        this.totalFindings = common.valueWithDefault(metric.findingsTotal, "0");
        this.auditedFindings = common.valueWithDefault(metric.findingsAudited, "0");
        this.auditedFindingPercent = common.calcProgressPercent(this.totalFindings, this.auditedFindings);

        this.totalViolations = common.valueWithDefault(metric.policyViolationsTotal, "0");
        this.auditedViolations = common.valueWithDefault(metric.policyViolationsAudited, "0");
        this.auditedViolationsPercent = common.calcProgressPercent(this.totalViolations, this.auditedViolations);
        this.failViolations = common.valueWithDefault(metric.policyViolationsFail, "0");
        this.failViolationsPercent = common.calcProgressPercent(this.totalViolations, this.failViolations);
        this.warnViolations = common.valueWithDefault(metric.policyViolationsWarn, "0");
        this.warnViolationsPercent = common.calcProgressPercent(this.totalViolations, this.warnViolations);
        this.infoViolations = common.valueWithDefault(metric.policyViolationsInfo, "0");
        this.infoViolationsPercent = common.calcProgressPercent(this.totalViolations, this.infoViolations);

        this.vulnerabilities = common.valueWithDefault(metric.vulnerabilities, "0");
        this.suppressed = common.valueWithDefault(metric.suppressed, "0");
        this.lastMeasurement = common.formatTimestamp(metric.lastOccurrence, true);
      },
      refreshMetrics() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/portfolio/refresh`;
        this.axios.get(url).then((response) => {
          this.$toastr.s(this.$t('message.metric_refresh_requested'));
        });
      }
    },
    mounted () {
      if (this.isPermitted(this.PERMISSIONS.VIEW_PORTFOLIO)) {
        const daysBack = 90;
        let url = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/portfolio/${daysBack}/days`;
        this.axios.get(url).then((response) => {
          this.$refs.portfolioWidgetRow.render(response.data)
          this.$refs.chartPortfolioVulnerabilities.render(response.data);
          this.$refs.chartProjectVulnerabilities.render(response.data);
          this.$refs.chartAuditedProgress.render(response.data);
          this.$refs.chartPolicyViolations.render(response.data);
          this.$refs.chartComponentVulnerabilities.render(response.data);
          this.extractStats(response.data);
        });
      }
    }
  }
</script>

<style>
  /* IE fix */
  #card-chart-01, #card-chart-02 {
    width: 100% !important;
  }
</style>
