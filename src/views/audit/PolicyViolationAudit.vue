<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_POLICY_VIOLATION">
    <div
      id="policyViolationAuditToolbar"
      class="filter-bar"
      role="toolbar"
      :aria-label="$t('message.filters')"
    >
      <div class="filter-pills">
        <multi-select-filter-pill
          v-if="isFilterVisible('violationState')"
          ref="filter_violationState"
          :field-label="$t('message.violation_state')"
          field-name="violationState"
          icon="fa-exclamation-circle"
          :options="violationStateOptions"
          v-model="violationStateFilter"
          @dismiss="onFilterDismiss('violationState')"
        />
        <multi-select-filter-pill
          v-if="isFilterVisible('riskType')"
          ref="filter_riskType"
          :field-label="$t('message.risk_type')"
          field-name="riskType"
          icon="fa-shield"
          :options="riskTypeOptions"
          v-model="riskTypeFilter"
          @dismiss="onFilterDismiss('riskType')"
        />
        <multi-select-filter-pill
          v-if="isFilterVisible('analysisState')"
          ref="filter_analysisState"
          :field-label="$t('message.analysis_state')"
          field-name="analysisState"
          icon="fa-tasks"
          :options="analysisStateOptions"
          v-model="analysisStateFilter"
          @dismiss="onFilterDismiss('analysisState')"
        />
        <text-search-filter-pill
          v-if="isFilterVisible('textSearch')"
          ref="filter_textSearch"
          :field-label="$t('message.search')"
          field-name="textSearch"
          icon="fa-search"
          :fields="textSearchFields"
          v-model="textSearchFilter"
          @dismiss="onFilterDismiss('textSearch')"
        />
        <date-time-range-filter-pill
          v-if="isFilterVisible('occurredOn')"
          ref="filter_occurredOn"
          :field-label="$t('message.occurred_on')"
          field-name="occurredOn"
          icon="fa-calendar"
          date-only
          v-model="occurredOnFilter"
          @dismiss="onFilterDismiss('occurredOn')"
        />
        <boolean-filter-pill
          v-if="isFilterVisible('showInactive')"
          :field-label="$t('message.show_inactive_projects')"
          field-name="showInactive"
          icon="fa-eye"
          v-model="showInactive"
        />
        <boolean-filter-pill
          v-if="isFilterVisible('showSuppressed')"
          :field-label="$t('message.show_suppressed_violations')"
          field-name="showSuppressed"
          icon="fa-eye"
          v-model="showSuppressed"
        />
        <b-dropdown
          v-if="addFilterOptions.length > 0"
          size="sm"
          variant="outline-primary"
          class="btn-more-filters"
          no-caret
        >
          <template #button-content>
            <span class="fa fa-plus" aria-hidden="true"></span>
            {{ $t('message.add_filter') }}
          </template>
          <b-dropdown-item
            v-for="filter in addFilterOptions"
            :key="filter.name"
            @click="showFilter(filter.name)"
            ><span
              :class="['fa', filter.icon, 'mr-2']"
              aria-hidden="true"
            ></span
            >{{ filter.label }}</b-dropdown-item
          >
        </b-dropdown>
        <b-button
          v-show="activeFilterCount >= 2"
          size="sm"
          variant="outline-danger"
          class="btn-clear-all-filters"
          @click="clearAllFilters"
        >
          <span class="fa fa-remove" aria-hidden="true"></span>
          {{ $t('message.clear_all') }}
        </b-button>
      </div>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="onLoadSuccess"
    >
    </bootstrap-table>
  </div>
</template>

<script>
import permissionsMixin from '../../mixins/permissionsMixin';
import filterPillsMixin from '@/mixins/filterPillsMixin';
import common from '@/shared/common';
import xssFilters from 'xss-filters';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';
import MultiSelectFilterPill from '@/views/components/MultiSelectFilterPill.vue';
import TextSearchFilterPill from '@/views/components/TextSearchFilterPill.vue';
import DateTimeRangeFilterPill from '@/views/components/DateTimeRangeFilterPill.vue';
import BooleanFilterPill from '@/views/components/BooleanFilterPill.vue';

export default {
  mixins: [permissionsMixin, filterPillsMixin],
  components: {
    MultiSelectFilterPill,
    TextSearchFilterPill,
    DateTimeRangeFilterPill,
    BooleanFilterPill,
  },
  computed: {
    allFilterDefs() {
      return [
        {
          name: 'violationState',
          label: this.$t('message.violation_state'),
          icon: 'fa-exclamation-circle',
        },
        {
          name: 'riskType',
          label: this.$t('message.risk_type'),
          icon: 'fa-shield',
        },
        {
          name: 'analysisState',
          label: this.$t('message.analysis_state'),
          icon: 'fa-tasks',
        },
        {
          name: 'textSearch',
          label: this.$t('message.search'),
          icon: 'fa-search',
        },
        {
          name: 'occurredOn',
          label: this.$t('message.occurred_on'),
          icon: 'fa-calendar',
        },
        {
          name: 'showInactive',
          label: this.$t('message.show_inactive_projects'),
          icon: 'fa-eye',
        },
        {
          name: 'showSuppressed',
          label: this.$t('message.show_suppressed_violations'),
          icon: 'fa-eye',
        },
      ];
    },
  },
  beforeDestroy() {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
    }
  },
  methods: {
    apiUrl() {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION}`;
      const params = {
        showInactive: this.showInactive === true,
        suppressed: this.showSuppressed === true,
      };
      if (this.violationStateFilter && this.violationStateFilter.length > 0) {
        params.violationState = this.violationStateFilter.join(',');
      }
      if (this.riskTypeFilter && this.riskTypeFilter.length > 0) {
        params.riskType = this.riskTypeFilter.join(',');
      }
      if (this.analysisStateFilter && this.analysisStateFilter.length > 0) {
        params.analysisState = this.analysisStateFilter.join(',');
      }
      if (this.occurredOnFilter) {
        if (this.occurredOnFilter.since) {
          params.occurredOnDateFrom = this.occurredOnFilter.since;
        }
        if (this.occurredOnFilter.before) {
          params.occurredOnDateTo = this.occurredOnFilter.before;
        }
      }
      if (this.textSearchFilter && this.textSearchFilter.value) {
        params.textSearchField = this.textSearchFilter.fields.join(',');
        params.textSearchInput = this.textSearchFilter.value;
      }
      return common.setQueryParams(url, params);
    },
    refreshTable() {
      if (this._refreshTimer) {
        clearTimeout(this._refreshTimer);
      }
      this._refreshTimer = setTimeout(() => {
        if (this.$refs.table) {
          this.$refs.table.refresh({
            url: this.apiUrl(),
            silent: true,
            pageNumber: 1,
          });
        }
      }, 200);
    },
    clearAllFilters() {
      this._clearing = true;
      try {
        this.showInactive = false;
        this.showSuppressed = false;
        this.violationStateFilter = [];
        this.riskTypeFilter = [];
        this.analysisStateFilter = [];
        this.occurredOnFilter = null;
        this.textSearchFilter = null;
        this.clearPendingFilters();
      } finally {
        this._clearing = false;
      }
      this.refreshTable();
    },
    onLoadSuccess() {
      loadUserPreferencesForBootstrapTable(
        this,
        'PolicyViolationAudit',
        this.$refs.table.columns,
      );
    },
  },
  data() {
    return {
      showInactive: false,
      showSuppressed: false,
      booleanFilters: ['showInactive', 'showSuppressed'],
      violationStateFilter: [],
      violationStateOptions: [
        { text: 'Fail', value: 'FAIL' },
        { text: 'Warn', value: 'WARN' },
        { text: 'Info', value: 'INFO' },
      ],
      riskTypeFilter: [],
      riskTypeOptions: [
        { text: 'License', value: 'LICENSE' },
        { text: 'Security', value: 'SECURITY' },
        { text: 'Operational', value: 'OPERATIONAL' },
      ],
      analysisStateFilter: [],
      analysisStateOptions: [
        { text: 'Not Set', value: 'NOT_SET' },
        { text: 'Rejected', value: 'REJECTED' },
        { text: 'Approved', value: 'APPROVED' },
      ],
      occurredOnFilter: null,
      textSearchFilter: null,
      textSearchFields: [
        { text: 'Policy Name', value: 'policy_name' },
        { text: 'Component', value: 'component' },
        { text: 'License', value: 'license' },
        { text: 'Project Name', value: 'project_name' },
      ],
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
              '../projects/' + row.project.uuid,
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
          visible: false,
          class: 'tight',
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.license'),
          field: 'component.license',
          sortable: true,
          visible: false,
          formatter(value, row, index) {
            if (
              Object.prototype.hasOwnProperty.call(
                row.component,
                'resolvedLicense',
              )
            ) {
              let licenseurl =
                '../../../licenses/' + row.component.resolvedLicense.licenseId;
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
        toolbar: '#policyViolationAuditToolbar',
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

<style scoped src="../components/filter-pills.css"></style>
