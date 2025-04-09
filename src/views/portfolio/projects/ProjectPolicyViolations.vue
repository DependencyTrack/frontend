<template>
  <div>
    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <div id="violationsToolbar" class="bs-table-custom-toolbar">
      <c-switch
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showSuppressedViolations"
        color="primary"
        v-model="showSuppressedViolations"
        label
        v-bind="labelIcon"
      /><span class="text-muted">{{
        $t('message.show_suppressed_violations')
      }}</span>
    </div>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
    >
    </bootstrap-table>
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import common from '../../../shared/common';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import permissionsMixin from '../../../mixins/permissionsMixin';
import xssFilters from 'xss-filters';
import i18n from '../../../i18n';
import BootstrapToggle from 'vue-bootstrap-toggle';
import $ from 'jquery';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';

export default {
  props: {
    uuid: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    cSwitch,
    BootstrapToggle,
  },
  beforeCreate() {
    this.showSuppressedViolations =
      localStorage &&
      localStorage.getItem(
        'ProjectPolicyViolationsShowSuppressedViolations',
      ) !== null
        ? localStorage.getItem(
            'ProjectPolicyViolationsShowSuppressedViolations',
          ) === 'true'
        : false;
  },
  data() {
    return {
      showSuppressedViolations: this.showSuppressedViolations,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      columns: [
        {
          title: this.$t('message.state'),
          field: 'policyCondition.policy.violationState',
          sortable: true,
          class: 'tight',
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              return common.formatViolationStateLabel(value);
            }
          },
        },
        {
          title: this.$t('message.risk_type'),
          field: 'type',
          sortable: true,
          class: 'tight',
          formatter(value, row, index) {
            return xssFilters.inHTMLData(
              common.capitalize(common.valueWithDefault(value, '')),
            );
          },
        },
        {
          title: this.$t('message.policy_name'),
          field: 'policyCondition.policy.name',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.component'),
          field: 'component.name',
          sortable: true,
          formatter: (value, row, index) => {
            if (row.component) {
              let url = xssFilters.uriInUnQuotedAttr(
                '../../../components/' + row.component.uuid,
              );
              let name = common.concatenateComponentName(
                null,
                row.component.name,
                row.component.version,
              );
              let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr(
                '../../../projects/' +
                  this.uuid +
                  '/dependencyGraph/' +
                  row.component.uuid,
              );
              return (
                `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` +
                `<a href="${url}">${xssFilters.inHTMLData(name)}</a>`
              );
            } else {
              return '';
            }
          },
        },
        {
          title: this.$t('message.occurred_on'),
          field: 'timestamp',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.formatTimestamp(value));
          },
        },
        {
          title: this.$t('message.analysis'),
          field: 'analysis.analysisState',
          sortable: false,
          formatter: common.makeAnalysisStateLabelFormatter(this),
        },
        {
          title: this.$t('message.suppressed'),
          field: 'analysis.isSuppressed',
          sortable: false,
          class: 'tight',
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
      ],
      data: [],
      options: {
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        toolbar: '#violationsToolbar',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage &&
          localStorage.getItem('ProjectPolicyViolationsPageSize') !== null
            ? Number(localStorage.getItem('ProjectPolicyViolationsPageSize'))
            : 10,
        sortName:
          localStorage &&
          localStorage.getItem('ProjectPolicyViolationsSortName') !== null
            ? localStorage.getItem('ProjectPolicyViolationsSortName')
            : undefined,
        sortOrder:
          localStorage &&
          localStorage.getItem('ProjectPolicyViolationsSortOrder') !== null
            ? localStorage.getItem('ProjectPolicyViolationsSortOrder')
            : undefined,
        icons: {
          detailOpen: 'fa-fw fa-angle-right',
          detailClose: 'fa-fw fa-angle-down',
          refresh: 'fa-refresh',
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

                    <div v-if="violation.policyCondition.subject === 'COORDINATES' ">
                      <b-form-group id="fieldset-1" :label="this.$t('message.group')" label-for="input-1">
                        <b-form-input id="input-1" v-model="violation.component.group" class="form-control disabled" readonly trim />
                      </b-form-group>
                      <b-form-group id="fieldset-2" :label="this.$t('message.name')" label-for="input-2">
                        <b-form-input id="input-2" v-model="violation.component.name" class="form-control disabled" readonly trim />
                      </b-form-group>
                      <b-form-group id="fieldset-3" :label="this.$t('message.version')" label-for="input-3">
                        <b-form-input id="input-3" v-model="violation.component.version" class="form-control disabled" readonly trim />
                      </b-form-group>
                    </div>

                    <div v-else-if="violation.policyCondition.subject === 'CPE' ">
                      <b-form-group v-if="violation.component.cpe" id="fieldset-1" :label="this.$t('message.cpe')" label-for="input-1">
                        <b-form-input id="input-1" v-model="violation.component.cpe" class="form-control disabled" readonly trim />
                      </b-form-group>
                    </div>

                    <div v-else-if="violation.policyCondition.subject === 'PACKAGE_URL' ">
                      <b-form-group v-if="violation.component.purl" id="fieldset-1" :label="this.$t('message.purl')" label-for="input-1">
                        <b-form-input id="input-1" v-model="violation.component.purl" class="form-control disabled" readonly trim />
                      </b-form-group>
                    </div>

                    <div v-else-if="violation.policyCondition.subject === 'SWID_TAGID' ">
                      <b-form-group v-if="violation.component.swid" id="fieldset-1" :label="this.$t('message.swid')" label-for="input-1">
                        <b-form-input id="input-1" v-model="violation.component.swid" class="form-control disabled" readonly trim />
                      </b-form-group>
                    </div>

                    <div v-else-if="violation.policyCondition.subject === 'LICENSE' || violation.policyCondition.subject === 'LICENSE_GROUP' ">
                      <b-form-group v-if="violation.component.resolvedLicense" id="fieldset-1" :label="this.$t('message.license')" label-for="input-1">
                        <b-form-input id="input-1" v-model="violation.component.resolvedLicense.licenseId" class="form-control disabled" readonly trim />
                      </b-form-group>
                    </div>

                    <b-form-group id="failedCondition" :label="this.$t('message.condition')" label-for="failedCondition-input">
                      <b-form-textarea id="failedCondition-input" v-model="conditionString" rows="3" class="form-control disabled" readonly trim />
                    </b-form-group>

                  </b-col>
                  <b-col sm="6">
                    <b-form-group id="fieldset-7" :label="this.$t('message.audit_trail')" label-for="auditTrailField">
                      <b-form-textarea id="auditTrailField" v-model="auditTrail" rows="7" class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-8" v-if="this.isPermitted(this.PERMISSIONS.POLICY_VIOLATION_ANALYSIS)" :label="this.$t('message.comment')" label-for="input-8">
                      <b-form-textarea id="input-8" v-model="comment" rows="4" class="form-control" trim />
                      <div class="pull-right">
                        <b-button size="sm" variant="outline-primary" @click="addComment"><span class="fa fa-comment-o"></span>{{ $t("message.add_comment") }}</b-button>
                      </div>
                    </b-form-group>
                    <b-form-group id="fieldset-9" v-if="this.isPermitted(this.PERMISSIONS.POLICY_VIOLATION_ANALYSIS)" :label="this.$t('message.analysis')" label-for="input-9">
                    <b-input-group id="input-9">
                      <b-form-select v-model="analysisState" :options="analysisChoices" @change="makeAnalysis" style="flex:0 1 auto; width:auto; margin-right:2rem;"/>
                      <bootstrap-toggle v-model="isSuppressed" :options="{ on: this.$t('message.suppressed'), off: this.$t('message.suppress'), onstyle: 'warning', offstyle: 'outline-disabled'}" :disabled="false" />
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
                violation: row,
                analysisChoices: [
                  { value: 'NOT_SET', text: this.$t('message.not_set') },
                  { value: 'APPROVED', text: this.$t('message.approved') },
                  { value: 'REJECTED', text: this.$t('message.rejected') },
                ],
                analysisState: null,
                projectUuid: projectUuid,
              };
            },
            computed: {
              conditionString: function () {
                return (
                  'subject == ' +
                  this.violation.policyCondition.subject +
                  ' && value ' +
                  this.violation.policyCondition.operator +
                  ' ' +
                  this.violation.policyCondition.value
                );
              },
            },
            watch: {
              isSuppressed: function (currentValue, oldValue) {
                if (oldValue != null) {
                  this.callRestEndpoint(this.analysisState, null, currentValue);
                }
              },
            },
            mixins: [permissionsMixin],
            methods: {
              getAnalysis: function () {
                let queryString =
                  '?policyViolation=' +
                  this.violation.uuid +
                  '&component=' +
                  this.violation.component.uuid;
                let url =
                  `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION_ANALYSIS}` +
                  queryString;
                this.axios.get(url).then((response) => {
                  this.updateAnalysisData(response.data);
                });
              },
              updateAnalysisData: function (analysis) {
                if (
                  Object.prototype.hasOwnProperty.call(
                    analysis,
                    'analysisComments',
                  )
                ) {
                  let trail = '';
                  for (let i = 0; i < analysis.analysisComments.length; i++) {
                    if (
                      Object.prototype.hasOwnProperty.call(
                        analysis.analysisComments[i],
                        'commenter',
                      )
                    ) {
                      trail += analysis.analysisComments[i].commenter + ' - ';
                    }
                    trail += common.formatTimestamp(
                      analysis.analysisComments[i].timestamp,
                      true,
                    );
                    trail += '\n';
                    trail += analysis.analysisComments[i].comment;
                    trail += '\n\n';
                  }
                  this.auditTrail = trail;
                }
                if (
                  Object.prototype.hasOwnProperty.call(
                    analysis,
                    'analysisState',
                  )
                ) {
                  this.analysisState = analysis.analysisState;
                }
                if (
                  Object.prototype.hasOwnProperty.call(analysis, 'isSuppressed')
                ) {
                  this.isSuppressed = analysis.isSuppressed;
                } else {
                  this.isSuppressed = false;
                }
              },
              makeAnalysis: function () {
                this.callRestEndpoint(this.analysisState, null, null);
              },
              addComment: function () {
                if (this.comment != null) {
                  this.callRestEndpoint(this.analysisState, this.comment, null);
                }
              },
              callRestEndpoint: function (
                analysisState,
                comment,
                isSuppressed,
              ) {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION_ANALYSIS}`;
                this.axios
                  .put(url, {
                    policyViolation: this.violation.uuid,
                    component: this.violation.component.uuid,
                    analysisState: analysisState,
                    comment: comment,
                    isSuppressed: isSuppressed,
                  })
                  .then((response) => {
                    this.$toastr.s(this.$t('message.updated'));
                    this.updateAnalysisData(response.data);
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
            },
            beforeMount() {
              this.getAnalysis();
            },
            components: {
              BootstrapToggle,
            },
          });
        },
        onExpandRow: this.vueFormatterInit,
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
        onPostBody: this.initializeTooltips,
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectPolicyViolationsPageSize',
              size.toString(),
            );
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectPolicyViolationsShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('ProjectPolicyViolationsSortName', name);
            localStorage.setItem('ProjectPolicyViolationsSortOrder', order);
          }
        },
      },
    };
  },
  methods: {
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION}/project/${this.uuid}`;
      if (this.showSuppressedViolations === undefined) {
        url += '?suppressed=false';
      } else {
        url += '?suppressed=' + this.showSuppressedViolations;
      }
      return url;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true,
      });
    },
    tableLoaded: function (data) {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectPolicyViolations',
        this.$refs.table.columns,
      );
      this.$emit('total', data.total);
      this.$emit('showSuppressedViolations', this.showSuppressedViolations);
    },
    initializeTooltips: function () {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
  },
  watch: {
    showSuppressedViolations() {
      if (localStorage) {
        localStorage.setItem(
          'ProjectPolicyViolationsShowSuppressedViolations',
          this.showSuppressedViolations.toString(),
        );
      }
      this.refreshTable();
    },
  },
};
</script>
