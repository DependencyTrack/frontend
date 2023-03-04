<template>
  <div>
    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <div id="findingsToolbar" class="bs-table-custom-toolbar">
      <b-button id="apply-vex-button" size="md" variant="outline-primary"
                v-b-modal.projectUploadVexModal
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <span class="fa fa-upload"></span> {{ $t('message.apply_vex') }}
      </b-button>
      <b-tooltip target="apply-vex-button" triggers="hover focus">{{ $t('message.apply_vex_tooltip') }}</b-tooltip>

      <b-button id="export-vex-button" size="md" variant="outline-primary"
                @click="downloadVex()"
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <span class="fa fa-download"></span> {{ $t('message.export_vex') }}
      </b-button>
      <b-tooltip target="export-vex-button" triggers="hover focus">{{ $t('message.export_vex_tooltip') }}</b-tooltip>

      <b-button id="export-vdr-button" size="md" variant="outline-primary"
                @click="downloadVdr()"
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <span class="fa fa-download"></span> {{ $t('message.export_vdr') }}
      </b-button>
      <b-tooltip target="export-vdr-button" triggers="hover focus">{{ $t('message.export_vdr_tooltip') }}</b-tooltip>

      <b-button id="reanalyze-button" size="md" variant="outline-primary"
                @click="reAnalyze()"
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY]">
        <span class="fa fa-refresh"></span> {{ $t('message.project_reanalyze') }}
      </b-button>
      <b-tooltip target="reanalyze-button" triggers="hover focus">{{ $t('message.project_reanalyze_tooltip') }}</b-tooltip>


      <!-- Future use when CSAF support is added
      <b-dropdown variant="outline-primary" v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <template #button-content>
          <span class="fa fa-download"></span> {{ $t('message.export_vex') }}
        </template>
        <b-dropdown-item @click="downloadVex('cyclonedx')" href="#">CycloneDX</b-dropdown-item>
        <b-dropdown-item @click="downloadVex('csaf')" href="#">CSAF</b-dropdown-item>
      </b-dropdown>
      -->
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showSuppressedFindings" color="primary" v-model="showSuppressedFindings" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_suppressed_findings') }}</span>
    </div>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded">
    </bootstrap-table>

    <project-upload-vex-modal :uuid="this.uuid" />
  </div>
</template>

<script>
  import { loadUserPreferencesForBootstrapTable } from "@/shared/utils";
import ProjectUploadVexModal from "@/views/portfolio/projects/ProjectUploadVexModal";
import { Switch as cSwitch } from '@coreui/vue';
import $ from "jquery";
import BootstrapToggle from 'vue-bootstrap-toggle';
import xssFilters from "xss-filters";
import i18n from "../../../i18n";
import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
import permissionsMixin from "../../../mixins/permissionsMixin";
import common from "../../../shared/common";

  export default {
    props: {
      uuid: String
    },
    mixins: [
      bootstrapTableMixin,
      permissionsMixin
    ],
    components: {
      cSwitch,
      BootstrapToggle,
      ProjectUploadVexModal
    },
    beforeCreate() {
      this.showSuppressedFindings = (localStorage && localStorage.getItem("ProjectFindingsShowSuppressedFindings") !== null) ? (localStorage.getItem("ProjectFindingsShowSuppressedFindings") === "true") : false;
    },
    data() {
      return {
        showSuppressedFindings: this.showSuppressedFindings,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        columns: [
          {
            title: this.$t('message.component'),
            field: "component.name",
            sortable: true,
            formatter: (value, row, index) => {
              let url = xssFilters.uriInUnQuotedAttr("../../../components/" + row.component.uuid);
              let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr("../../../projects/" + this.uuid + "/dependencyGraph/" + row.component.uuid)
              return `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` + `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "component.version",
            sortable: true,
            formatter(value, row, index) {
              if (Object.prototype.hasOwnProperty.call(row.component, "latestVersion")) {
                if (row.component.latestVersion !== row.component.version) {
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Outdated component. Current version is: '+ xssFilters.inHTMLData(row.component.latestVersion) + '"><i class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.component.version);
                } else {
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Component version is the latest available from the configured repositories"><i class="fa fa-exclamation-triangle status-passed" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.component.version);
                }
              } else {
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
          },
          {
            title: this.$t('message.latest_version'),
            field: "component.latestVersion",
            sortable: true,
            formatter(value, row, index) {
              if (Object.prototype.hasOwnProperty.call(row.component, "latestVersion")) {
                // outdated component
                return xssFilters.inHTMLData(row.component.latestVersion);
              } else {
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
          },
          {
            title: this.$t('message.group'),
            field: "component.group",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.vulnerability'),
            field: "vulnerability.vulnId",
            sortable: true,
            formatter(value, row, index) {
              if (row.vulnerability.uuid) {
                let url = xssFilters.uriInUnQuotedAttr("../../../vulnerabilities/" + row.vulnerability.source + "/" + value);
                return common.formatSourceLabel(row.vulnerability.source) + ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
              } else {
                // outdated component
                return xssFilters.inHTMLData("Outdated Component");
              }
            }
          },
          {
            title: this.$t('message.aliases'),
            field: "vulnerability.aliases",
            sortable: true,
            visible: false,
            formatter(value, row, index) {
              if (row.vulnerability.uuid) {
                if (typeof value !== 'undefined') {
                  let label = "";
                  for (let i=0; i<value.length; i++) {
                    let alias = common.resolveVulnAliasInfo(row.vulnerability.source, value[i]);
                    let url = xssFilters.uriInUnQuotedAttr("../../../vulnerabilities/" + alias.source + "/" + alias.vulnId);
                    label += common.formatSourceLabel(alias.source) + ` <a href="${url}">${xssFilters.inHTMLData(alias.vulnId)}</a>`
                    if (i < value.length-1) label += ", "
                  }
                  return label;
                }
              } else {
                // outdated component
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
          },
          {
            title: this.$t('message.cwe'),
            field: "vulnerability.cwes",
            sortable: true,
            visible: false,
            formatter(value, row, index) {
              if (row.vulnerability.uuid) {
                if (typeof value !== 'undefined') {
                  let label = "";
                  for (let i=0; i<value.length; i++) {
                    label += common.formatCweShortLabel(value[i].cweId, value[i].name);
                    if (i < value.length-1) label += ", "
                  }
                  return label;
                }
              } else {
                // outdated component
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
          },
          {
            title: this.$t('message.severity'),
            field: "vulnerability.severity",
            sortName: "vulnerability.severityRank",
            sortable: true,
            formatter(value, row, index) {
              if (row.vulnerability.uuid && typeof value !== 'undefined') {
                return common.formatSeverityLabel(value);
              } else {
                // outdated component
                return "";
              }
            }
          },
          {
            title: this.$t('message.analyzer'),
            field: "attribution.analyzerIdentity",
            sortable: true,
            formatter(value, row, index) {
              if (row.vulnerability.uuid) {
                return common.formatAnalyzerLabel(row.attribution.analyzerIdentity, row.vulnerability.source, row.vulnerability.vulnId,
                  row.attribution.alternateIdentifier, row.attribution.referenceUrl);
              } else {
                // outdated component
                return common.formatAnalyzerLabel('INTERNAL_ANALYZER', "Dependency Track", null, null, null);
              }
            }
          },
          {
            title: this.$t('message.attributed_on'),
            field: "attribution.attributedOn",
            sortable: true,
            formatter(value, row, index) {
              if (row.vulnerability.uuid) {
                return xssFilters.inHTMLData(common.formatTimestamp(value));
              } else {
                // outdated component
                if (Object.prototype.hasOwnProperty.call(row.component, "lastCheck")) {
                  return xssFilters.inHTMLData(common.formatTimestamp(row.component.lastCheck));
                }
              }
            }
          },
          {
            title: this.$t('message.analysis'),
            field: "analysis.state",
            sortable: true,
            formatter: common.makeAnalysisStateLabelFormatter(this),
          },
          {
            title: this.$t('message.suppressed'),
            field: "analysis.isSuppressed",
            sortable: true,
            class: "tight",
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          }
        ],
        data: [],
        options: {
          onPostBody: this.initializeTooltips,
          search: true,
          showColumns: true,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'client',
          toolbar: '#findingsToolbar',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: (localStorage && localStorage.getItem("ProjectFindingsPageSize") !== null) ? Number(localStorage.getItem("ProjectFindingsPageSize")) : 10,
          sortName: (localStorage && localStorage.getItem("ProjectFindingsSortName") !== null) ? localStorage.getItem("ProjectFindingsSortName") : undefined,
          sortOrder: (localStorage && localStorage.getItem("ProjectFindingsSortOrder") !== null) ? localStorage.getItem("ProjectFindingsSortOrder") : undefined,
          icons: {
            detailOpen: 'fa-fw fa-angle-right',
            detailClose: 'fa-fw fa-angle-down',
            refresh: 'fa-refresh'
          },
          detailView: true,
          detailViewIcon: true,
          detailViewByClick: false,
          detailFormatter: (index, row) => {
            let projectUuid = this.uuid;
            return this.vueFormatter({
              i18n,
              template: `
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <div v-if="finding.vulnerability.aliases && finding.vulnerability.aliases.length > 0">
                    <label>Aliases</label>
                      <b-card class="font-weight-bold">
                        <b-card-text>
                          <span v-for="alias in finding.vulnerability.aliases">
                          <b-link style="margin-right:1.0rem" :href="'/vulnerabilities/' + aliasLabel(finding.vulnerability.source, alias).source + '/' + aliasLabel(finding.vulnerability.source, alias).vulnId">{{aliasLabel(finding.vulnerability.source, alias).vulnId}}</b-link>
                         </span>
                        </b-card-text>
                     </b-card>
                    </div>
                    <b-form-group v-if="finding.vulnerability.title" id="fieldset-1" :label="this.$t('message.title')" label-for="input-1">
                      <b-form-input id="input-1" v-model="finding.vulnerability.title" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="finding.vulnerability.subtitle" id="fieldset-2" :label="this.$t('message.subtitle')" label-for="input-2">
                      <b-form-input id="input-2" v-model="finding.vulnerability.subtitle" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="finding.vulnerability.description" id="fieldset-3" :label="this.$t('message.description')" label-for="input-3">
                      <b-form-textarea id="input-3" v-model="finding.vulnerability.description" rows="7" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="finding.vulnerability.recommendation" id="fieldset-4" :label="this.$t('message.recommendation')" label-for="input-4">
                      <b-form-textarea id="input-4" v-model="finding.vulnerability.recommendation" rows="7" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="finding.vulnerability.cvssV2Vector" id="fieldset-5" :label="this.$t('message.cvss_v2_vector')" label-for="input-5">
                      <b-form-input id="input-5" v-model="finding.vulnerability.cvssV2Vector" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="finding.vulnerability.cvssV3Vector" id="fieldset-6" :label="this.$t('message.cvss_v3_vector')" label-for="input-6">
                      <b-form-input id="input-6" v-model="finding.vulnerability.cvssV3Vector" class="form-control disabled" readonly trim />
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                    <b-form-group id="fieldset-7" :label="this.$t('message.audit_trail')" label-for="auditTrailField">
                      <b-form-textarea id="auditTrailField" v-model="auditTrail" rows="7" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-8" v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)" :label="this.$t('message.comment')" label-for="input-8">
                      <b-form-textarea id="input-8" v-model="comment" rows="4" class="form-control" trim />
                      <div class="pull-right">
                        <b-button size="sm" variant="outline-primary" @click="addComment"><span class="fa fa-comment-o"></span> {{ this.$t('message.add_comment') }}</b-button>
                      </div>
                    </b-form-group>
                    <b-form-group id="fieldset-9" v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)" :label="this.$t('message.analysis')" label-for="input-9">
                      <b-input-group id="input-9">
                        <b-form-select v-model="analysisState" :options="analysisChoices" @change="makeAnalysis" style="flex:0 1 auto; width:auto; margin-right:2rem;" v-b-tooltip.hover :title="this.$t('message.analysis_tooltip')"/>
                        <bootstrap-toggle v-model="isSuppressed" :options="{ on: this.$t('message.suppressed'), off: this.$t('message.suppress'), onstyle: 'warning', offstyle: 'outline-disabled'}" :disabled="analysisState === null" />
                      </b-input-group>
                    </b-form-group>
                    <b-row v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)">
                      <b-col sm="6">
                        <b-form-group id="fieldset-10" :label="this.$t('message.justification')" label-for="input-10">
                          <b-input-group id="input-10">
                            <b-form-select v-model="analysisJustification" :options="justificationChoices" @change="makeAnalysis" :disabled="analysisState === null || analysisState !== 'NOT_AFFECTED'" v-b-tooltip.hover :title="$t('message.justification_tooltip')" />
                          </b-input-group>
                        </b-form-group>
                      </b-col>
                      <b-col sm="6">
                        <b-form-group id="fieldset-11" :label="this.$t('message.response')" label-for="input-11">
                          <b-input-group id="input-11">
                            <b-form-select v-model="analysisResponse" :options="responseChoices" :disabled="analysisState === null" @change="makeAnalysis" v-b-tooltip.hover :title="this.$t('message.response_tooltip')" />
                          </b-input-group>
                        </b-form-group>
                      </b-col>
                    </b-row>
                    <b-form-group id="fieldset-12" v-if="this.isPermitted(this.PERMISSIONS.VIEW_VULNERABILITY)" :label="this.$t('message.details')" label-for="analysisDetailsField">
                      <b-form-textarea id="analysisDetailsField" v-model="analysisDetails" rows="7" class="form-control" :disabled="analysisState === null || !this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)" v-b-tooltip.hover :title="this.$t('message.analysis_details_tooltip')" />
                      <div class="pull-right">
                        <b-button v-if="this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)" :disabled="analysisState === null" size="sm" variant="outline-primary" @click="makeAnalysis"><span class="fa fa-comment-o"></span> {{ this.$t('message.update_details') }}</b-button>
                      </div>
                    </b-form-group>
                  </b-col>
                </b-row>
              `,
              data() {
                return {
                  auditTrail: null,
                  comment: null,
                  isSuppressed: !!(row && row.analysis && row.analysis.isSuppressed),
                  finding: row,
                  analysisChoices: [
                    { value: 'NOT_SET', text: this.$t('message.not_set') },
                    { value: 'EXPLOITABLE', text: this.$t('message.exploitable') },
                    { value: 'IN_TRIAGE', text: this.$t('message.in_triage') },
                    { value: 'RESOLVED', text: this.$t('message.resolved') },
                    { value: 'FALSE_POSITIVE', text: this.$t('message.false_positive') },
                    { value: 'NOT_AFFECTED', text: this.$t('message.not_affected') },
                  ],
                  justificationChoices: [
                    { value: 'NOT_SET', text: this.$t('message.not_set') },
                    { value: 'CODE_NOT_PRESENT', text: this.$t('message.code_not_present') },
                    { value: 'CODE_NOT_REACHABLE', text: this.$t('message.code_not_reachable') },
                    { value: 'REQUIRES_CONFIGURATION', text: this.$t('message.requires_configuration') },
                    { value: 'REQUIRES_DEPENDENCY', text: this.$t('message.requires_dependency') },
                    { value: 'REQUIRES_ENVIRONMENT', text: this.$t('message.requires_environment') },
                    { value: 'PROTECTED_BY_COMPILER', text: this.$t('message.protected_by_compiler') },
                    { value: 'PROTECTED_AT_RUNTIME', text: this.$t('message.protected_at_runtime') },
                    { value: 'PROTECTED_AT_PERIMETER', text: this.$t('message.protected_at_perimeter') },
                    { value: 'PROTECTED_BY_MITIGATING_CONTROL', text: this.$t('message.protected_by_mitigating_control') }
                  ],
                  responseChoices: [
                    { value: 'NOT_SET', text: this.$t('message.not_set') },
                    { value: 'CAN_NOT_FIX', text: this.$t('message.can_not_fix') },
                    { value: 'WILL_NOT_FIX', text: this.$t('message.will_not_fix') },
                    { value: 'UPDATE', text: this.$t('message.update') },
                    { value: 'ROLLBACK', text: this.$t('message.rollback') },
                    { value: 'WORKAROUND_AVAILABLE', text: this.$t('message.workaround_available') }
                  ],
                  analysisState: null,
                  analysisJustification: null,
                  analysisResponse: null,
                  analysisDetails: null,
                  projectUuid: projectUuid
                }
              },
              watch: {
                isSuppressed: function (currentValue, oldValue) {
                  if (oldValue != null) {
                    this.callRestEndpoint(this.analysisState, this.analysisJustification, this.analysisResponse, null, null, currentValue);
                  }
                }
              },
              mixins: [permissionsMixin],
              methods: {
                aliasLabel: function(vulnSource, alias) {
                  return common.resolveVulnAliasInfo(vulnSource, alias);
                },
                getAnalysis: function() {
                  let queryString = "?project=" + projectUuid + "&component=" + this.finding.component.uuid + "&vulnerability=" + this.finding.vulnerability.uuid;
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}` + queryString;
                  this.axios.get(url, {
                    validateStatus: (status) => status === 200 || status === 404
                  }).then((response) => {
                    this.updateAnalysisData(response.data);
                  });
                },
                updateAnalysisData: function(analysis) {
                  if (Object.prototype.hasOwnProperty.call(analysis, "analysisComments")) {
                    let trail = "";
                    for (let i = 0; i < analysis.analysisComments.length; i++) {
                      if (Object.prototype.hasOwnProperty.call(analysis.analysisComments[i], "commenter")) {
                        trail += analysis.analysisComments[i].commenter + " - ";
                      }
                      trail += common.formatTimestamp(analysis.analysisComments[i].timestamp, true);
                      trail += "\n";
                      trail += analysis.analysisComments[i].comment;
                      trail += "\n\n";
                    }
                    this.auditTrail = trail;
                  }
                  if (Object.prototype.hasOwnProperty.call(analysis, "analysisState")) {
                    this.analysisState = analysis.analysisState;
                  }
                  if (Object.prototype.hasOwnProperty.call(analysis, "analysisJustification")) {
                    this.analysisJustification = analysis.analysisJustification;
                  }
                  if (Object.prototype.hasOwnProperty.call(analysis, "analysisResponse")) {
                    this.analysisResponse = analysis.analysisResponse;
                  }
                  if (Object.prototype.hasOwnProperty.call(analysis, "analysisDetails")) {
                    this.analysisDetails = analysis.analysisDetails;
                  }
                  if (Object.prototype.hasOwnProperty.call(analysis, "isSuppressed")) {
                    this.isSuppressed = analysis.isSuppressed;
                  } else {
                    this.isSuppressed = false;
                  }
                },
                makeAnalysis: function() {
                  this.callRestEndpoint(this.analysisState,  this.analysisJustification, this.analysisResponse, this.analysisDetails, null, null);
                },
                addComment: function() {
                  if (this.comment != null) {
                    this.callRestEndpoint(this.analysisState, this.analysisJustification, this.analysisResponse, this.analysisDetails, this.comment, null);
                  }
                  this.comment = null;
                },
                callRestEndpoint: function(analysisState, analysisJustification, analysisResponse, analysisDetails, comment, isSuppressed) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}`;
                  this.axios.put(url, {
                    project: projectUuid,
                    component: this.finding.component.uuid,
                    vulnerability: this.finding.vulnerability.uuid,
                    analysisState: analysisState,
                    analysisJustification: analysisJustification,
                    analysisResponse: analysisResponse,
                    analysisDetails: analysisDetails,
                    comment: comment,
                    isSuppressed: isSuppressed
                  }).then((response) => {
                    this.$toastr.s(this.$t('message.updated'));
                    this.updateAnalysisData(response.data);
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                }
              },
              beforeMount() {
                this.getAnalysis();
              },
              components: {
                BootstrapToggle
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: this.apiUrl(),
          onPageChange: ((number, size) => {
            if (localStorage) {
              localStorage.setItem("ProjectFindingsPageSize", size.toString())
            }
          }),
          onColumnSwitch: ((field, checked) => {
            if (localStorage) {
              localStorage.setItem("ProjectFindingsShow"+common.capitalize(field), checked.toString())
            }
          }),
          onSort: ((name, order) => {
            if (localStorage) {
              localStorage.setItem("ProjectFindingsSortName", name);
              localStorage.setItem("ProjectFindingsSortOrder", order);
            }
          })
        }
      };
    },
    methods: {
      apiUrl: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}`
        if (this.showSuppressedFindings === undefined) {
          url += "?suppressed=false";
        } else {
          url += "?suppressed=" + this.showSuppressedFindings;
        }
        return url;
      },
      downloadVex: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_VEX}/cyclonedx/project/${this.uuid}`;
        this.axios.request({
          responseType: 'blob',
          url: url,
          method: 'get',
          params: {
            download: 'true'
          }
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          let filename = "vex.json";
          let disposition = response.headers["content-disposition"]
          if (disposition && disposition.indexOf('attachment') !== -1) {
            let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            let matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        });
      },
      downloadVdr: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_BOM}/cyclonedx/project/${this.uuid}`;
        this.axios.request({
          responseType: 'blob',
          url: url,
          method: 'get',
          params: {
            format: 'json',
            variant: 'vdr',
            download: 'true'
          }
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          let filename = "bom.json";
          let disposition = response.headers["content-disposition"]
          if (disposition && disposition.indexOf('attachment') !== -1) {
            let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            let matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        });
      },
      reAnalyze: function (data) {
        let analyzeUrl = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}/analyze`
        this.axios.post(analyzeUrl).then((response) => {
          this.$toastr.s(this.$t('message.project_reanalyze_requested'));
          //ignore token from response, don't wait for completion
          this.refreshTable();
        });
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      },
      tableLoaded: function(data) {
        loadUserPreferencesForBootstrapTable(this, "ProjectFindings", this.$refs.table.columns);
        this.$emit('total', data.total);
      },
      initializeTooltips: function () {
        $('[data-toggle="tooltip"]').tooltip({
          trigger: "hover"
        });
      },
    },
    watch:{
      showSuppressedFindings() {
        if (localStorage) {
          localStorage.setItem("ProjectFindingsShowSuppressedFindings", this.showSuppressedFindings.toString());
        }
        this.refreshTable();
      }
    },
  };
</script>
