<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_POLICY_VIOLATION">
    <b-row>
      <b-col xs="6" sm="4" md="4" lg="2" id="filter-controls">
        <div>
          <h3 style="display: inline">{{ this.$t('message.filters') }}</h3>
          <b-button
            size="md"
            variant="outline-primary"
            style="float: right"
            @click="clearAllFilters()"
          >
            {{ this.$t('message.clear_all') }}</b-button
          >
          <br /><br />
          <b-form-group
            id="showInactive-form-group"
            :label="this.$t('message.projects')"
          >
            <b-form-checkbox
              id="showInactive-form-checkbox"
              v-model="showInactive"
              value="true"
              unchecked-value="false"
            >
              {{ this.$t('message.show_inactive_projects') }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            id="showSuppressed-form-group"
            :label="this.$t('message.analysis_status')"
          >
            <b-form-checkbox
              id="showSuppressed-form-checkbox"
              v-model="showSuppressed"
              value="true"
              unchecked-value="false"
            >
              {{ this.$t('message.show_suppressed_violations') }}
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            id="violation-state-form-group"
            :label="this.$t('message.violation_state')"
          >
            <b-form-checkbox-group
              id="violation-state-form-checkbox-group"
              v-model="violationStateSelected"
              :options="violationStateOptions"
              stacked
            >
            </b-form-checkbox-group>
          </b-form-group>
          <b-form-group
            id="risk-type-form-group"
            :label="this.$t('message.risk_type')"
          >
            <b-form-checkbox-group
              id="risk-type-form-checkbox-group"
              v-model="riskTypeSelected"
              :options="riskTypeOptions"
              stacked
            >
            </b-form-checkbox-group>
          </b-form-group>
          <b-form-group
            id="analysis-type-form-group"
            :label="this.$t('message.analysis_state')"
          >
            <b-form-checkbox-group
              id="analysis-type-form-checkbox-group"
              v-model="analysisStateSelected"
              :options="analysisStateOptions"
              stacked
            >
            </b-form-checkbox-group>
          </b-form-group>
          <b-form-group
            id="occurred-on-date-form-group"
            :label="this.$t('message.occurred_on')"
          >
            <b-datepicker
              id="occurred-on-datepicker-from"
              v-model="occurredOnDateFrom"
              :max="occurredOnDateTo"
              :placeholder="this.$t('message.from')"
            ></b-datepicker>
            <b-datepicker
              id="occurred-on-datepicker-to"
              v-model="occurredOnDateTo"
              :min="occurredOnDateFrom"
              :placeholder="this.$t('message.to')"
            ></b-datepicker>
          </b-form-group>
          <b-form-group
            id="text-search-form-group"
            :label="this.$t('message.text_search')"
          >
            <b-form-input
              id="text-search-form-input"
              v-model="textSearchInput"
              debounce="750"
              :placeholder="this.$t('message.search')"
            ></b-form-input>
            Search in:
            <b-form-checkbox-group
              id="text-search-form-checkbox-group"
              v-model="textSearchSelected"
              :options="textSearchOptions"
              stacked
            >
            </b-form-checkbox-group>
          </b-form-group>
          <b-form-group
            id="policy-form-group"
            :label="this.$t('message.policies')"
            v-permission="PERMISSIONS.POLICY_MANAGEMENT"
          >
            <b-form-checkbox-group
              id="policy-form-checkbox-group"
              v-model="policySelected"
              :options="policyOptions"
              stacked
            >
            </b-form-checkbox-group>
          </b-form-group>
        </div>
      </b-col>
      <b-col xs="6" sm="8" md="8" lg="10">
        <bootstrap-table
          ref="table"
          :columns="columns"
          :data="data"
          :options="options"
          @on-load-success="onLoadSuccess"
        >
        </bootstrap-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import permissionsMixin from '../../mixins/permissionsMixin';
import common from '@/shared/common';
import xssFilters from 'xss-filters';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';
import { hasPermission } from '@/shared/permissions';
import * as permissions from '@/shared/permissions';

export default {
  mixins: [permissionsMixin],
  computed: {
    watchers() {
      return [
        this.showInactive,
        this.showSuppressed,
        this.violationStateSelected,
        this.riskTypeSelected,
        this.policySelected,
        this.analysisStateSelected,
        this.occurredOnDateFrom,
        this.occurredOnDateTo,
      ];
    },
  },
  beforeMount() {
    this.initializeWatchers();
    this.initializePolicies();
    this.textSearchSelected = this.textSearchOptions.map(
      (option) => option.value,
    );
  },
  methods: {
    initializePolicies: function () {
      let policyUrl = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`;
      if (
        hasPermission(permissions.POLICY_MANAGEMENT, this.decodedToken) ||
        hasPermission(permissions.ACCESS_MANAGEMENT, this.decodedToken)
      ) {
        this.axios
          .get(policyUrl)
          .then((response) => {
            if (response.data) {
              response.data.forEach((policy) =>
                this.policyOptions.push({
                  text: policy.name,
                  value: policy.uuid,
                }),
              );
            }
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
    },
    initializeWatchers: function () {
      this.simpleWatcher = this.$watch('watchers', () => this.refreshTable());
      this.textSearchSelectedWatcher = this.$watch('textSearchSelected', () => {
        if (this.textSearchInput.trim().length !== 0) {
          this.refreshTable();
        }
      });
      this.textSearchInputWatcher = this.$watch(
        'textSearchInput',
        (newInput, oldInput) => {
          if (!(newInput.trim().length === 0 && oldInput.trim().length === 0)) {
            this.refreshTable();
          }
        },
      );
    },
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION}`;
      url +=
        '?showInactive=' +
        (this.showInactive === 'true') +
        '&suppressed=' +
        (this.showSuppressed === 'true');
      if (
        this.violationStateSelected &&
        this.violationStateSelected.length > 0
      ) {
        url += '&violationState=' + this.violationStateSelected;
      }
      if (this.riskTypeSelected && this.riskTypeSelected.length > 0) {
        url += '&riskType=' + this.riskTypeSelected;
      }
      if (this.policySelected && this.policySelected.length > 0) {
        url += '&policy=' + this.policySelected;
      }
      if (this.analysisStateSelected && this.analysisStateSelected.length > 0) {
        url += '&analysisState=' + this.analysisStateSelected;
      }
      if (this.occurredOnDateFrom && this.occurredOnDateFrom.length > 0) {
        url += '&occurredOnDateFrom=' + this.occurredOnDateFrom;
      }
      if (this.occurredOnDateTo && this.occurredOnDateTo.length > 0) {
        url += '&occurredOnDateTo=' + this.occurredOnDateTo;
      }
      if (this.textSearchInput && this.textSearchInput.trim().length > 0) {
        url +=
          '&textSearchField=' +
          this.textSearchSelected +
          '&textSearchInput=' +
          this.textSearchInput.trim();
      }
      return url;
    },
    clearAllFilters: function () {
      this.simpleWatcher();
      this.textSearchSelectedWatcher();
      this.textSearchInputWatcher();
      this.showInactive = false;
      this.showSuppressed = false;
      this.violationStateSelected = [];
      this.riskTypeSelected = [];
      this.policySelected = [];
      this.analysisStateSelected = [];
      this.occurredOnDateFrom = '';
      this.occurredOnDateTo = '';
      this.textSearchInput = '';
      this.textSearchSelected = this.textSearchOptions.map(
        (option) => option.value,
      );
      this.refreshTable();
      this.initializeWatchers();
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true,
      });
    },
    onLoadSuccess: function () {
      loadUserPreferencesForBootstrapTable(
        this,
        'PolicyViolationAudit',
        this.$refs.table.columns,
      );
    },
  },
  data() {
    return {
      simpleWatcher: null,
      textSearchSelectedWatcher: null,
      textSearchInputWatcher: null,
      showInactive: false,
      showSuppressed: false,
      violationStateSelected: [],
      violationStateOptions: [
        { text: 'Fail', value: 'FAIL' },
        { text: 'Warn', value: 'WARN' },
        { text: 'Info', value: 'INFO' },
      ],
      riskTypeSelected: [],
      riskTypeOptions: [
        { text: 'License', value: 'LICENSE' },
        { text: 'Security', value: 'SECURITY' },
        { text: 'Operational', value: 'OPERATIONAL' },
      ],
      policySelected: [],
      policyOptions: [],
      analysisStateSelected: [],
      analysisStateOptions: [
        { text: 'Not Set', value: 'NOT_SET' },
        { text: 'Rejected', value: 'REJECTED' },
        { text: 'Approved', value: 'APPROVED' },
      ],
      occurredOnDateFrom: '',
      occurredOnDateTo: '',
      textSearchInput: '',
      textSearchOptions: [
        { text: 'Policy Name', value: 'policy_name' },
        { text: 'Component', value: 'component' },
        { text: 'License', value: 'license' },
        { text: 'Project Name', value: 'project_name' },
      ],
      textSearchSelected: [],
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
                './components/' + row.component.uuid,
              );
              let name = common.concatenateComponentName(
                null,
                row.component.name,
                row.component.version,
              );
              let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr(
                './projects/' +
                  row.project.uuid +
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
          title: this.$t('message.project_name'),
          field: 'project.name',
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              './projects/' + row.project.uuid,
            );
            let name = common.concatenateComponentName(
              null,
              row.project.name,
              row.project.version,
            );
            return `<a href="${url}">${xssFilters.inHTMLData(name)}</a>`;
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
        {
          title: this.$t('message.license'),
          field: 'component.license',
          sortable: true,
          formatter(value, row, index) {
            if (
              Object.prototype.hasOwnProperty.call(
                row.component,
                'resolvedLicense',
              )
            ) {
              let licenseurl =
                './licenses/' + row.component.resolvedLicense.licenseId;
              return (
                '<a href="' +
                licenseurl +
                '">' +
                xssFilters.inHTMLData(row.component.resolvedLicense.licenseId) +
                '</a>'
              );
            } else {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
            }
          },
        },
      ],
      data: [],
      options: {
        search: false,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage &&
          localStorage.getItem('PolicyViolationAuditPageSize') !== null
            ? Number(localStorage.getItem('PolicyViolationAuditPageSize'))
            : 10,
        sortName:
          localStorage &&
          localStorage.getItem('PolicyViolationAuditSortName') !== null
            ? localStorage.getItem('PolicyViolationAuditSortName')
            : 'timestamp',
        sortOrder:
          localStorage &&
          localStorage.getItem('PolicyViolationAuditSortOrder') !== null
            ? localStorage.getItem('PolicyViolationAuditSortOrder')
            : 'desc',
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem(
              'PolicyViolationAuditPageSize',
              size.toString(),
            );
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'PolicyViolationAuditShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('PolicyViolationAuditSortName', name);
            localStorage.setItem('PolicyViolationAuditSortOrder', order);
          }
        },
      },
    };
  },
};
</script>
