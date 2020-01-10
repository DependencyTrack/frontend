<template>
  <div>
    <div id="componentToolbar">
      <span v-permission:and="[PERMISSIONS.PORTFOLIO_MANAGEMENT, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <bootstrap-toggle v-model="isAuditModeEnabled" :options="{ size: 'small', width: 150, on: 'Audit Mode', off: 'Audit Mode', onstyle: 'warning', offstyle: 'outline-disabled'}" :disabled="false"/>
      </span>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
  </div>
</template>

<script>
  import common from "../../../shared/common";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import xssFilters from "xss-filters";
  import i18n from "../../../i18n";
  import BootstrapToggle from 'vue-bootstrap-toggle'
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    props: {
      uuid: String
    },
    mixins: [bootstrapTableMixin, permissionsMixin],
    components: {
      BootstrapToggle
    },
    watch: {
      isAuditModeEnabled: function(value) {
        if (value) {
          this.$refs.table.showColumn("analysis.state");
          this.$refs.table.showColumn("analysis.isSuppressed");
        } else {
          this.$refs.table.hideColumn("analysis.state");
          this.$refs.table.hideColumn("analysis.isSuppressed");
        }

      }
    },
    data() {
      return {
        isAuditModeEnabled: false,
        columns: [
          {
            title: this.$t('message.name'),
            field: "vulnId",
            sortable: true,
            class: "tight",
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../vulnerabilities/" + row.source + "/" + value);
              return common.formatSourceLabel(row.source) + ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.published'),
            field: "published",
            sortable: true,
            class: "tight",
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatTimestamp(value);
              }
            }
          },
          {
            title: this.$t('message.cwe'),
            field: "cwe",
            sortable: false,
            class: "expand",
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return `CWE-${value.cweId} ${value.name}`;
              }
            }
          },
          {
            title: this.$t('message.severity'),
            field: "severity",
            class: "tight",
            sortable: false,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatSeverityLabel(value);
              }
            }
          },
          {
            title: this.$t('message.analysis'),
            field: "analysis.state",
            sortable: false,
            class: "tight",
            visible: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.suppressed'),
            field: "analysis.isSuppressed",
            sortable: false,
            class: "tight",
            visible: false,
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
          sidePagination: 'server',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          detailView: true,
          detailViewIcon: false,
          detailViewByClick: true,
          detailFormatter: (index, row) => {
            if (! this.isAuditModeEnabled) return null;
            let componentUuid = this.uuid;
            return this.vueFormatter({
              i18n,
              template: `
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-form-group v-if="vulnerability.title" id="fieldset-1" :label="this.$t('message.title')" label-for="input-1">
                      <b-form-input id="input-1" v-model="vulnerability.title" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="vulnerability.subtitle" id="fieldset-2" :label="this.$t('message.subtitle')" label-for="input-2">
                      <b-form-input id="input-2" v-model="vulnerability.subtitle" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="vulnerability.description" id="fieldset-3" :label="this.$t('message.description')" label-for="input-3">
                      <b-form-textarea id="input-3" v-model="vulnerability.description" rows="7" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="vulnerability.recommendation" id="fieldset-4" :label="this.$t('message.recommendation')" label-for="input-4">
                      <b-form-textarea id="input-4" v-model="vulnerability.recommendation" rows="7" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="vulnerability.cvssV2Vector" id="fieldset-5" :label="this.$t('message.cvss_v2_vector')" label-for="input-5">
                      <b-form-input id="input-5" v-model="vulnerability.cvssV2Vector" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group v-if="vulnerability.cvssV3Vector" id="fieldset-6" :label="this.$t('message.cvss_v3_vector')" label-for="input-6">
                      <b-form-input id="input-6" v-model="vulnerability.cvssV3Vector" class="form-control disabled" readonly trim />
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
                  vulnerability: row,
                  analysisChoices: [
                    { value: 'NOT_SET', text: this.$t('message.not_set') },
                    { value: 'EXPLOITABLE', text: this.$t('message.exploitable') },
                    { value: 'IN_TRIAGE', text: this.$t('message.in_triage') },
                    { value: 'FALSE_POSITIVE', text: this.$t('message.false_positive') },
                    { value: 'NOT_AFFECTED', text: this.$t('message.not_affected') }
                  ],
                  analysisState: null,
                  componentUuid: componentUuid
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
                  let queryString = "?component=" + componentUuid + "&vulnerability=" + this.vulnerability.uuid;
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}` + queryString;
                  this.axios.get(url).then((response) => {
                    let analysis = response.data;
                    if (analysis.hasOwnProperty("analysisComments")) {
                      let trail = "";
                      for (let i = 0; i < analysis.analysisComments.length; i++) {
                        if (analysis.analysisComments[i].hasOwnProperty("commenter")) {
                          trail += analysis.analysisComments[i].commenter + " - ";
                        }
                        trail += common.formatTimestamp(analysis.analysisComments[i].timestamp, true);
                        trail += "\n";
                        trail += analysis.analysisComments[i].comment;
                        trail += "\n\n";
                      }
                      this.auditTrail = trail;
                    }
                    if (analysis.hasOwnProperty("analysisState")) {
                      this.analysisState = analysis.analysisState;
                    }
                    if (analysis.hasOwnProperty("isSuppressed")) {
                      this.isSuppressed = analysis.isSuppressed;
                    } else {
                      this.isSuppressed = false;
                    }
                  });
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
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}/global`;
                  this.axios.put(url, {
                    component: componentUuid,
                    vulnerability: this.vulnerability.uuid,
                    analysisState: analysisState,
                    comment: comment,
                    isSuppressed: isSuppressed
                  }).then((response) => {
                    this.$toastr.s(this.$t('message.updated'));
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
          toolbar: '#componentToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/component/${this.uuid}`
        }
      };
    }
  };
</script>
