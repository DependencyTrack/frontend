<template>
  <div>
    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <div id="findingsToolbar" class="bs-table-custom-toolbar">
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showSuppressedFindings" color="primary" v-model="showSuppressedFindings" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_suppressed_findings') }}</span>
    </div>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      v-on:onLoadSuccess="tableLoaded">
    </bootstrap-table>
  </div>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import common from "../../../shared/common";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import xssFilters from "xss-filters";
  import i18n from "../../../i18n";
  import BootstrapToggle from 'vue-bootstrap-toggle'

  export default {
    props: {
      uuid: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      cSwitch,
      BootstrapToggle
    },
    data() {
      const router = this.$router;
      return {
        showSuppressedFindings: false,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        columns: [
          {
            title: this.$t('message.component'),
            field: "component.name",
            sortable: true,
            formatter(value, row, index) {
              const url = xssFilters.uriInUnQuotedAttr(router.resolve({name: 'Component', params: {uuid: row.component.uuid}}).href);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "component.version",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
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
              const url = xssFilters.uriInUnQuotedAttr(router.resolve({name: 'Vulnerability', params: {source: row.vulnerability.source, vulnId: value}}).href);
              return common.formatSourceLabel(row.vulnerability.source) + ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.cwe'),
            field: "vulnerability.cweId",
            sortable: true,
            class: "expand-20",
            visible: false,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatCweLabel(value, row.vulnerability.cweName);
              }
            }
          },
          {
            title: this.$t('message.severity'),
            field: "vulnerability.severity",
            sortName: "vulnerability.severityRank",
            sortable: true,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatSeverityLabel(value);
              }
            }
          },
          {
            title: this.$t('message.analyzer'),
            field: "attribution.analyzerIdentity",
            sortable: true,
            formatter(value, row, index) {
              console.log(row);
              return common.formatAnalyzerLabel(row.attribution.analyzerIdentity, row.vulnerability.vulnId,
                row.attribution.alternateIdentifier, row.attribution.referenceUrl);
            }
          },
          {
            title: this.$t('message.attributed_on'),
            field: "attribution.attributedOn",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.formatTimestamp(value));
            }
          },
          {
            title: this.$t('message.analysis'),
            field: "analysis.state",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
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
          search: true,
          showColumns: true,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'client',
          toolbar: '#findingsToolbar',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
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
                    <b-form-group id="fieldset-8" :label="this.$t('message.comment')" label-for="input-8">
                      <b-form-textarea id="input-8" v-model="comment" rows="4" class="form-control" trim />
                      <div class="pull-right">
                        <b-button size="sm" variant="outline-primary" @click="addComment"><span class="fa fa-comment-o"></span> Add Comment</b-button>
                      </div>
                    </b-form-group>
                    <b-form-group id="fieldset-9" :label="this.$t('message.analysis')" label-for="input-9">
                    <b-input-group id="input-9">
                      <b-form-select v-model="analysisState" :options="analysisChoices" @change="makeAnalysis" style="flex:0 1 auto; width:auto; margin-right:2rem;"/>
                      <bootstrap-toggle v-model="isSuppressed" :options="{ on: 'Suppressed', off: 'Suppress', onstyle: 'warning', offstyle: 'outline-disabled'}" :disabled="false" />
                    </b-input-group>
                    </b-form-group>
                  </b-col>
                </b-row>
              `,
              data() {
                return {
                  auditTrail: null,
                  comment: null,
                  isSuppressed: null,
                  finding: row,
                  analysisChoices: [
                    { value: 'NOT_SET', text: this.$t('message.not_set') },
                    { value: 'EXPLOITABLE', text: this.$t('message.exploitable') },
                    { value: 'IN_TRIAGE', text: this.$t('message.in_triage') },
                    { value: 'FALSE_POSITIVE', text: this.$t('message.false_positive') },
                    { value: 'NOT_AFFECTED', text: this.$t('message.not_affected') }
                  ],
                  analysisState: null,
                  projectUuid: projectUuid
                }
              },
              watch: {
                isSuppressed: function (currentValue, oldValue) {
                  if (oldValue != null) {
                    this.callRestEndpoint(this.analysisState, null, currentValue);
                  }
                }
              },
              methods: {
                getAnalysis: function() {
                  const url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}`;
                  this.axios.get(url, {
                    params: {
					  project: projectUuid,
					  component: this.finding.component.uuid,
					  vulnerability: this.finding.vulnerability.uuid,
					}
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
                  if (Object.prototype.hasOwnProperty.call(analysis, "isSuppressed")) {
                    this.isSuppressed = analysis.isSuppressed;
                  } else {
                    this.isSuppressed = false;
                  }
                },
                makeAnalysis: function() {
                  this.callRestEndpoint(this.analysisState, null, null);
                },
                addComment: function() {
                  if (this.comment != null) {
                    this.callRestEndpoint(this.analysisState, this.comment, null);
                  }
                },
                callRestEndpoint: function(analysisState, comment, isSuppressed) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}`;
                  this.axios.put(url, {
                    project: projectUuid,
                    component: this.finding.component.uuid,
                    vulnerability: this.finding.vulnerability.uuid,
                    analysisState: analysisState,
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
          url: this.apiUrl()
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
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      },
      tableLoaded: function(data) {
        this.$emit('total', data.total);
      }
    },
    watch:{
      showSuppressedFindings() {
        this.refreshTable();
      }
    },
  };
</script>
