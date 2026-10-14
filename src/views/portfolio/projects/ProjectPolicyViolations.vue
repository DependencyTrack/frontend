<template>
  <div>
    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <filter-bar
      toolbar-id="violationsToolbar"
      :add-filter-options="addFilterOptions"
      :active-filter-count="activeFilterCount"
      @show-filter="showFilter"
      @clear-all="clearAllFilters"
    >
      <boolean-filter-pill
        v-if="isFilterVisible('showSuppressedViolations')"
        :field-label="$t('message.show_suppressed_violations')"
        field-name="showSuppressedViolations"
        icon="fa-eye"
        v-model="showSuppressedViolations"
      />
    </filter-bar>

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
import common from '../../../shared/common';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import filterPillsMixin from '../../../mixins/filterPillsMixin';
import FilterBar from '../../components/FilterBar.vue';
import BooleanFilterPill from '../../components/BooleanFilterPill.vue';
import xssFilters from 'xss-filters';
import PolicyViolationDetails from './PolicyViolationDetails.vue';
import $ from 'jquery';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';

export default {
  props: {
    uuid: String,
  },
  mixins: [bootstrapTableMixin, filterPillsMixin],
  components: {
    FilterBar,
    BooleanFilterPill,
  },
  created() {
    this.options.url = this.apiUrl();
  },
  data() {
    return {
      showSuppressedViolations:
        !!localStorage &&
        localStorage.getItem(
          'ProjectPolicyViolationsShowSuppressedViolations',
        ) === 'true',
      booleanFilters: ['showSuppressedViolations'],
      columns: [
        {
          title: this.$t('message.state'),
          field: 'policyCondition.policy.violationState',
          sortable: true,
          class: 'tight',
          formatter(value) {
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
          formatter(value) {
            return xssFilters.inHTMLData(
              common.capitalize(common.valueWithDefault(value, '')),
            );
          },
        },
        {
          title: this.$t('message.policy_name'),
          field: 'policyCondition.policy.name',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.component'),
          field: 'component.name',
          sortable: true,
          formatter: (_value, row) => {
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
                `<a href="${dependencyGraphUrl}"><i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Show in dependency graph"></i></a> ` +
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
          formatter(value) {
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
          formatter(value) {
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
        detailFormatter: (_index, row) => {
          return this.cell(PolicyViolationDetails, { violation: row });
        },
        onExpandRow: this.mountCells,
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        onPostBody: this.initializeTooltips,
        onPageChange: (_number, size) => {
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
        pageNumber: 1,
        silent: true,
      });
    },
    persistFilter: function (key, value) {
      if (localStorage) {
        localStorage.setItem(key, value.toString());
      }
    },
    tableLoaded: function (data) {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectPolicyViolations',
        this.$refs.table.columns,
      );
      this.$emit('total', data.total);
    },
    initializeTooltips: function () {
      $('[data-bs-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
  },
  computed: {
    allFilterDefs() {
      return [
        {
          name: 'showSuppressedViolations',
          label: this.$t('message.show_suppressed_violations'),
          icon: 'fa-eye',
        },
      ];
    },
  },
  watch: {
    showSuppressedViolations(value) {
      this.persistFilter(
        'ProjectPolicyViolationsShowSuppressedViolations',
        value,
      );
    },
  },
};
</script>
