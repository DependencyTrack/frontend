<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row ref="portfolioWidgetRow" />
    <b-card>
      <b-row>
        <b-col sm="5">
          <h4 id="chart-portfolio-vulns" class="card-title mb-0">
            {{ $t('message.portfolio_vulnerabilities') }}
          </h4>
          <div class="small text-muted">
            {{ $t('message.last_measurement') }}: {{ lastMeasurement
            }}<b-link
              v-permission="'PORTFOLIO_MANAGEMENT'"
              class="font-weight-bold"
              style="margin-left: 6px"
              v-on:click="refreshMetrics"
              ><i class="fa fa-refresh"></i
            ></b-link>
          </div>
        </b-col>
        <b-col sm="7" class="d-none d-md-block"> </b-col>
      </b-row>
      <chart-portfolio-vulnerabilities
        ref="chartPortfolioVulnerabilities"
        chartId="chartPortfolioVulnerabilities"
        class="chart-wrapper"
        style="height: 200px; margin-top: 40px"
        :height="200"
      ></chart-portfolio-vulnerabilities>
      <div slot="footer">
        <b-row class="text-center">
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('severity.critical') }}</div>
            <strong>{{ critical }} ({{ criticalPercent }}%)</strong>
            <b-progress
              height="{}"
              class="progress-xs mt-2 severity-critical"
              :precision="1"
              v-bind:value="criticalPercent"
            ></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('severity.high') }}</div>
            <strong>{{ high }} ({{ highPercent }}%)</strong>
            <b-progress
              height="{}"
              class="progress-xs mt-2 severity-high"
              :precision="1"
              v-bind:value="highPercent"
            ></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('severity.medium') }}</div>
            <strong>{{ medium }} ({{ mediumPercent }}%)</strong>
            <b-progress
              height="{}"
              class="progress-xs mt-2 severity-medium"
              :precision="1"
              v-bind:value="mediumPercent"
            ></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('severity.low') }}</div>
            <strong>{{ low }} ({{ lowPercent }}%)</strong>
            <b-progress
              height="{}"
              class="progress-xs mt-2 severity-low"
              :precision="1"
              v-bind:value="lowPercent"
            ></b-progress>
          </b-col>
          <b-col class="mb-sm-2 mb-0">
            <div class="text-muted">{{ $t('severity.unassigned') }}</div>
            <strong>{{ unassigned }} ({{ unassignedPercent }}%)</strong>
            <b-progress
              height="{}"
              class="progress-xs mt-2 status-failed"
              :precision="1"
              v-bind:value="unassignedPercent"
            ></b-progress>
          </b-col>
        </b-row>
      </div>
    </b-card>

    <b-row>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-policy-violations-state" class="card-title mb-0">
                {{ $t('message.policy_violations') }}
              </h4>
              <div class="small text-muted">
                {{ $t('message.policy_violations_by_state') }}
              </div>
            </b-col>
            <b-col sm="7" class="d-none d-md-block"> </b-col>
          </b-row>
          <chart-policy-violations-state
            ref="chartPolicyViolationsState"
            chartId="chartPolicyViolationsState"
            class="chart-wrapper"
            style="height: 200px; margin-top: 40px"
            :height="200"
          ></chart-policy-violations-state>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('policy_violation.fails') }}</div>
                <strong
                  >{{ failViolations }} ({{ failViolationsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-failed"
                  :precision="1"
                  v-bind:value="failViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('policy_violation.warns') }}</div>
                <strong
                  >{{ warnViolations }} ({{ warnViolationsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-warning"
                  :precision="1"
                  v-bind:value="warnViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('policy_violation.infos') }}</div>
                <strong
                  >{{ infoViolations }} ({{ infoViolationsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-info"
                  :precision="1"
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
              <h4
                id="chart-policy-violations-classification"
                class="card-title mb-0"
              >
                {{ $t('message.policy_violations') }}
              </h4>
              <div class="small text-muted">
                {{ $t('message.policy_violations_by_classification') }}
              </div>
            </b-col>
            <b-col sm="7" class="d-none d-md-block"> </b-col>
          </b-row>
          <chart-policy-violations-classification
            ref="chartPolicyViolationsClassification"
            chartId="chartPolicyViolationsClassification"
            class="chart-wrapper"
            style="height: 200px; margin-top: 40px"
            :height="200"
          ></chart-policy-violations-classification>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('policy_violation.security') }}
                </div>
                <strong
                  >{{ securityViolations }} ({{
                    securityViolationsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-failed"
                  :precision="1"
                  v-bind:value="securityViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('policy_violation.operational') }}
                </div>
                <strong
                  >{{ operationalViolations }} ({{
                    operationalViolationsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-warning"
                  :precision="1"
                  v-bind:value="operationalViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('policy_violation.license') }}
                </div>
                <strong
                  >{{ licenseViolations }} ({{
                    licenseViolationsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-info"
                  :precision="1"
                  v-bind:value="licenseViolationsPercent"
                ></b-progress>
              </b-col>
            </b-row>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-auditing-findings-progress" class="card-title mb-0">
                {{ $t('message.auditing_progress') }}
              </h4>
              <div class="small text-muted">{{ $t('message.findings') }}</div>
            </b-col>
            <b-col sm="7" class="d-none d-md-block"> </b-col>
          </b-row>
          <chart-auditing-findings-progress
            ref="chartAuditingFindingsProgress"
            chartId="chartAuditingFindingsProgress"
            class="chart-wrapper"
            style="height: 200px; margin-top: 40px"
            :height="200"
          ></chart-auditing-findings-progress>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('message.findings_unaudited') }}
                </div>
                <strong
                  >{{ unauditedFindings }} ({{
                    unauditedFindingsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 severity-unassigned"
                  :precision="1"
                  v-bind:value="unauditedFindingsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('message.findings_audited') }}
                </div>
                <strong
                  >{{ auditedFindings }} ({{ auditedFindingsPercent }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 severity-low"
                  :precision="1"
                  v-bind:value="auditedFindingsPercent"
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
              <h4
                id="chart-auditing-violations-progress"
                class="card-title mb-0"
              >
                {{ $t('message.auditing_progress') }}
              </h4>
              <div class="small text-muted">
                {{ $t('message.policy_violations') }}
              </div>
            </b-col>
            <b-col sm="7" class="d-none d-md-block"> </b-col>
          </b-row>
          <chart-auditing-violations-progress
            ref="chartAuditingViolationsProgress"
            chartId="chartAuditingViolationsProgress"
            class="chart-wrapper"
            style="height: 200px; margin-top: 40px"
            :height="200"
          ></chart-auditing-violations-progress>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('message.violations_unaudited') }}
                </div>
                <strong
                  >{{ unauditedViolations }} ({{
                    unauditedViolationsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 severity-unassigned"
                  :precision="1"
                  v-bind:value="unauditedViolationsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">
                  {{ $t('message.violations_audited') }}
                </div>
                <strong
                  >{{ auditedViolations }} ({{
                    auditedViolationsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 severity-low"
                  :precision="1"
                  v-bind:value="auditedViolationsPercent"
                ></b-progress>
              </b-col>
            </b-row>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col sm="6">
        <b-card>
          <b-row>
            <b-col sm="5">
              <h4 id="chart-projects" class="card-title mb-0">
                {{ $t('message.projects') }}
              </h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block"> </b-col>
          </b-row>
          <chart-project-vulnerabilities
            ref="chartProjectVulnerabilities"
            chartId="chartProjectVulnerabilities"
            class="chart-wrapper"
            style="height: 200px; margin-top: 40px"
            :height="200"
          ></chart-project-vulnerabilities>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('message.non_vulnerable') }}</div>
                <strong
                  >{{ nonVulnerableProjects }} ({{
                    nonVulnerableProjectsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-passed"
                  :precision="1"
                  v-bind:value="nonVulnerableProjectsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('message.vulnerable') }}</div>
                <strong
                  >{{ vulnerableProjects }} ({{
                    vulnerableProjectsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-warning"
                  :precision="1"
                  v-bind:value="vulnerableProjectsPercent"
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
              <h4 id="chart-components" class="card-title mb-0">
                {{ $t('message.components') }}
              </h4>
            </b-col>
            <b-col sm="7" class="d-none d-md-block"> </b-col>
          </b-row>
          <chart-component-vulnerabilities
            ref="chartComponentVulnerabilities"
            chartId="chartComponentVulnerabilities"
            class="chart-wrapper"
            style="height: 200px; margin-top: 40px"
            :height="200"
          ></chart-component-vulnerabilities>
          <div slot="footer">
            <b-row class="text-center">
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('message.non_vulnerable') }}</div>
                <strong
                  >{{ nonVulnerableComponents }} ({{
                    nonVulnerableComponentsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-passed"
                  :precision="1"
                  v-bind:value="nonVulnerableComponentsPercent"
                ></b-progress>
              </b-col>
              <b-col class="mb-sm-2 mb-0">
                <div class="text-muted">{{ $t('message.vulnerable') }}</div>
                <strong
                  >{{ vulnerableComponents }} ({{
                    vulnerableComponentsPercent
                  }}%)</strong
                >
                <b-progress
                  height="{}"
                  class="progress-xs mt-2 status-warning"
                  :precision="1"
                  v-bind:value="vulnerableComponentsPercent"
                ></b-progress>
              </b-col>
            </b-row>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col md="12">
        <b-card v-bind:header="$t('message.portfolio_statistics')">
          <b-row>
            <b-col sm="12" lg="4">
              <b-row>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{
                      $t('message.projects')
                    }}</small
                    ><br />
                    <strong class="h4">{{ totalProjects }}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="danger">
                    <small class="text-muted">{{
                      $t('message.vulnerable_projects')
                    }}</small
                    ><br />
                    <strong class="h4">{{ vulnerableProjects }}</strong>
                  </Callout>
                </b-col>
              </b-row>
            </b-col>
            <b-col sm="12" lg="4">
              <b-row>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{
                      $t('message.components')
                    }}</small
                    ><br />
                    <strong class="h4">{{ totalComponents }}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="danger">
                    <small class="text-muted">{{
                      $t('message.vulnerable_components')
                    }}</small
                    ><br />
                    <strong class="h4">{{ vulnerableComponents }}</strong>
                  </Callout>
                </b-col>
              </b-row>
            </b-col>
            <b-col sm="12" lg="4">
              <b-row>
                <b-col sm="6">
                  <Callout variant="danger">
                    <small class="text-muted">{{
                      $t('message.portfolio_vulnerabilities')
                    }}</small
                    ><br />
                    <strong class="h4">{{ vulnerabilities }}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="warning">
                    <small class="text-muted">{{
                      $t('message.suppressed')
                    }}</small
                    ><br />
                    <strong class="h4">{{ suppressed }}</strong>
                  </Callout>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="12" lg="4">
              <b-row>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{
                      $t('message.policy_violations')
                    }}</small
                    ><br />
                    <strong class="h4">{{ totalViolations }}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{
                      $t('policy_violation.license')
                    }}</small
                    ><br />
                    <strong class="h4">{{ licenseViolations }}</strong>
                  </Callout>
                </b-col>
              </b-row>
            </b-col>
            <b-col sm="12" lg="4">
              <b-row>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{
                      $t('policy_violation.operational')
                    }}</small
                    ><br />
                    <strong class="h4">{{ operationalViolations }}</strong>
                  </Callout>
                </b-col>
                <b-col sm="6">
                  <Callout variant="info">
                    <small class="text-muted">{{
                      $t('policy_violation.security')
                    }}</small
                    ><br />
                    <strong class="h4">{{ securityViolations }}</strong>
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
import common from '../shared/common';
import PortfolioWidgetRow from './dashboard/PortfolioWidgetRow';
import ChartPortfolioVulnerabilities from './dashboard/ChartPortfolioVulnerabilities';
import ChartProjectVulnerabilities from './dashboard/ChartProjectVulnerabilities';
import ChartAuditingFindingsProgress from './dashboard/ChartAuditingFindingsProgress';
import ChartAuditingViolationsProgress from './dashboard/ChartAuditingViolationsProgress';
import ChartPolicyViolationsState from './dashboard/ChartPolicyViolationsState';
import ChartPolicyViolationsClassification from './dashboard/ChartPolicyViolationsClassification';
import ChartComponentVulnerabilities from './dashboard/ChartComponentVulnerabilities';
import { Callout } from '@coreui/vue';
import permissionsMixin from '../mixins/permissionsMixin';

export default {
  name: 'dashboard',
  mixins: [permissionsMixin],
  components: {
    Callout,
    PortfolioWidgetRow,
    ChartPortfolioVulnerabilities,
    ChartProjectVulnerabilities,
    ChartAuditingFindingsProgress,
    ChartAuditingViolationsProgress,
    ChartPolicyViolationsState,
    ChartPolicyViolationsClassification,
    ChartComponentVulnerabilities,
  },
  data() {
    return {
      totalProjects: 0,
      vulnerableProjects: 0,
      vulnerableProjectsPercent: 0,
      nonVulnerableProjects: 0,
      nonVulnerableProjectsPercent: 0,

      totalComponents: 0,
      vulnerableComponents: 0,
      vulnerableComponentsPercent: 0,
      nonVulnerableComponents: 0,
      nonVulnerableComponentsPercent: 0,

      totalFindings: 0,
      auditedFindings: 0,
      auditedFindingsPercent: 0,
      unauditedFindings: 0,
      unauditedFindingsPercent: 0,

      totalViolations: 0,
      auditedViolations: 0,
      auditedViolationsPercent: 0,
      unauditedViolations: 0,
      unauditedViolationsPercent: 0,
      failViolations: 0,
      failViolationsPercent: 0,
      warnViolations: 0,
      warnViolationsPercent: 0,
      infoViolations: 0,
      infoViolationsPercent: 0,
      securityViolations: 0,
      securityViolationsPercent: 0,
      operationalViolations: 0,
      operationalViolationsPercent: 0,
      licenseViolations: 0,
      licenseViolationsPercent: 0,

      vulnerabilities: 0,
      suppressed: 0,
      critical: 0,
      criticalPercent: 0,
      high: 0,
      highPercent: 0,
      medium: 0,
      mediumPercent: 0,
      low: 0,
      lowPercent: 0,
      unassigned: 0,
      unassignedPercent: 0,
      lastMeasurement: '',
    };
  },
  methods: {
    extractStats(metrics) {
      if (!metrics || metrics.length === 0) {
        return;
      }
      let metric = metrics[metrics.length - 1]; //Use the most recent metric
      this.totalProjects = common.valueWithDefault(metric.projects, '0');
      this.vulnerableProjects = common.valueWithDefault(
        metric.vulnerableProjects,
        '0',
      );
      this.vulnerableProjectsPercent = common.calcProgressPercent(
        this.totalProjects,
        this.vulnerableProjects,
      );
      this.nonVulnerableProjects = this.totalProjects - this.vulnerableProjects;
      this.nonVulnerableProjectsPercent = common.calcProgressPercent(
        this.totalProjects,
        this.nonVulnerableProjects,
      );

      this.totalComponents = common.valueWithDefault(metric.components, '0');
      this.vulnerableComponents = common.valueWithDefault(
        metric.vulnerableComponents,
        '0',
      );
      this.vulnerableComponentsPercent = common.calcProgressPercent(
        this.totalComponents,
        this.vulnerableComponents,
      );
      this.nonVulnerableComponents =
        this.totalComponents - this.vulnerableComponents;
      this.nonVulnerableComponentsPercent = common.calcProgressPercent(
        this.totalComponents,
        this.nonVulnerableComponents,
      );

      this.totalFindings = common.valueWithDefault(metric.findingsTotal, '0');
      this.auditedFindings = common.valueWithDefault(
        metric.findingsAudited,
        '0',
      );
      this.auditedFindingsPercent = common.calcProgressPercent(
        this.totalFindings,
        this.auditedFindings,
      );
      this.unauditedFindings = common.valueWithDefault(
        metric.findingsUnaudited,
        '0',
      );
      this.unauditedFindingsPercent = common.calcProgressPercent(
        this.totalFindings,
        this.unauditedFindings,
      );

      this.totalViolations = common.valueWithDefault(
        metric.policyViolationsTotal,
        '0',
      );
      this.auditedViolations = common.valueWithDefault(
        metric.policyViolationsAudited,
        '0',
      );
      this.auditedViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.auditedViolations,
      );
      this.unauditedViolations = this.totalViolations - this.auditedViolations;
      this.unauditedViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.unauditedViolations,
      );
      this.failViolations = common.valueWithDefault(
        metric.policyViolationsFail,
        '0',
      );
      this.failViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.failViolations,
      );
      this.warnViolations = common.valueWithDefault(
        metric.policyViolationsWarn,
        '0',
      );
      this.warnViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.warnViolations,
      );
      this.infoViolations = common.valueWithDefault(
        metric.policyViolationsInfo,
        '0',
      );
      this.infoViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.infoViolations,
      );
      this.securityViolations = common.valueWithDefault(
        metric.policyViolationsSecurityTotal,
        '0',
      );
      this.securityViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.securityViolations,
      );
      this.operationalViolations = common.valueWithDefault(
        metric.policyViolationsOperationalTotal,
        '0',
      );
      this.operationalViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.operationalViolations,
      );
      this.licenseViolations = common.valueWithDefault(
        metric.policyViolationsLicenseTotal,
        '0',
      );
      this.licenseViolationsPercent = common.calcProgressPercent(
        this.totalViolations,
        this.licenseViolations,
      );

      this.vulnerabilities = common.valueWithDefault(
        metric.vulnerabilities,
        '0',
      );
      this.suppressed = common.valueWithDefault(metric.suppressed, '0');
      this.critical = common.valueWithDefault(metric.critical, '0');
      this.criticalPercent = common.calcProgressPercent(
        this.vulnerabilities,
        this.critical,
      );
      this.high = common.valueWithDefault(metric.high, '0');
      this.highPercent = common.calcProgressPercent(
        this.vulnerabilities,
        this.high,
      );
      this.medium = common.valueWithDefault(metric.medium, '0');
      this.mediumPercent = common.calcProgressPercent(
        this.vulnerabilities,
        this.medium,
      );
      this.low = common.valueWithDefault(metric.low, '0');
      this.lowPercent = common.calcProgressPercent(
        this.vulnerabilities,
        this.low,
      );
      this.unassigned = common.valueWithDefault(metric.unassigned, '0');
      this.unassignedPercent = common.calcProgressPercent(
        this.vulnerabilities,
        this.unassigned,
      );
      this.lastMeasurement = common.formatTimestamp(
        metric.lastOccurrence,
        true,
      );
    },
    refreshMetrics() {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/portfolio/refresh`;
      this.axios.get(url).then((response) => {
        this.$toastr.s(this.$t('message.metric_refresh_requested'));
      });
    },
  },
  mounted() {
    if (this.isPermitted(this.PERMISSIONS.VIEW_PORTFOLIO)) {
      const daysBack = 90;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/portfolio/${daysBack}/days`;
      this.axios.get(url).then((response) => {
        this.$refs.portfolioWidgetRow.render(response.data);
        this.$refs.chartPortfolioVulnerabilities.render(response.data);
        this.$refs.chartProjectVulnerabilities.render(response.data);
        this.$refs.chartAuditingFindingsProgress.render(response.data);
        this.$refs.chartAuditingViolationsProgress.render(response.data);
        this.$refs.chartPolicyViolationsState.render(response.data);
        this.$refs.chartPolicyViolationsClassification.render(response.data);
        this.$refs.chartComponentVulnerabilities.render(response.data);
        this.extractStats(response.data);
      });
    }
  },
};
</script>

<style>
/* IE fix */
#card-chart-01,
#card-chart-02 {
  width: 100% !important;
}
</style>
