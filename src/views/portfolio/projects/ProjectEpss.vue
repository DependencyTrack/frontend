<template>
  <div>
    <chart-epss-vs-cvss
      ref="chartEpssVsCvss"
      chartId="chartEpssVsCvss"
      class="chart-wrapper"
      style="height: 400px; margin-top: 40px"
      :height="400"
    />

    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <filter-bar
      toolbar-id="epssToolbar"
      :add-filter-options="addFilterOptions"
      :active-filter-count="activeFilterCount"
      @show-filter="showFilter"
      @clear-all="clearAllFilters"
    >
      <boolean-filter-pill
        v-if="isFilterVisible('showSuppressedFindings')"
        :field-label="$t('message.show_suppressed_findings')"
        field-name="showSuppressedFindings"
        icon="fa-eye"
        v-model="showSuppressedFindings"
      />
      <boolean-filter-pill
        v-if="isFilterVisible('showKevOnly')"
        :field-label="$t('message.kev')"
        field-name="showKevOnly"
        icon="fa-crosshairs"
        v-model="showKevOnly"
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
import {
  applyTotalCountHeaders,
  compareVersions,
  loadUserPreferencesForBootstrapTable,
} from '@/shared/utils';
import i18n from '@/i18n';
import $ from 'jquery';
import BootstrapToggle from 'vue-bootstrap-toggle';
import xssFilters from 'xss-filters';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import filterPillsMixin from '../../../mixins/filterPillsMixin';
import common from '../../../shared/common';
import FilterBar from '../../components/FilterBar.vue';
import BooleanFilterPill from '../../components/BooleanFilterPill.vue';
import KevAssertionsModal from '../../components/KevAssertionsModal.vue';
import ChartEpssVsCvss from '../../dashboard/ChartEpssVsCvss';

export default {
  props: {
    uuid: String,
  },
  mixins: [bootstrapTableMixin, filterPillsMixin],
  components: {
    FilterBar,
    BooleanFilterPill,
    BootstrapToggle,
    ChartEpssVsCvss,
    KevAssertionsModal,
  },
  beforeCreate() {
    this.showSuppressedFindings =
      !!localStorage &&
      localStorage.getItem('ProjectEpssShowSuppressedFindings') === 'true';
    this.showKevOnly =
      !!localStorage &&
      localStorage.getItem('ProjectEpssShowKevOnly') === 'true';
  },
  data() {
    return {
      showSuppressedFindings: this.showSuppressedFindings,
      showKevOnly: this.showKevOnly,
      booleanFilters: ['showSuppressedFindings', 'showKevOnly'],
      columns: [
        {
          title: this.$t('message.component'),
          field: 'component.name',
          sortable: true,
          formatter: (value, row) => {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../../components/' + row.component.uuid,
            );
            let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr(
              '../../../projects/' +
                this.uuid +
                '/dependencyGraph/' +
                row.component.uuid,
            );
            return (
              `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` +
              `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.version'),
          field: 'component.version',
          sortable: true,
          formatter(value, row) {
            if (row.component.latestVersion) {
              if (
                compareVersions(
                  row.component.latestVersion,
                  row.component.version,
                ) > 0
              ) {
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Outdated component. Current version is: ' +
                  xssFilters.inHTMLData(row.component.latestVersion) +
                  '"><i class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.component.version)
                );
              } else if (
                compareVersions(
                  row.component.latestVersion,
                  row.component.version,
                ) < 0
              ) {
                // should be unstable then
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Unstable component. Current stable version is: ' +
                  xssFilters.inHTMLData(row.component.latestVersion) +
                  '"><i class="fa fa-exclamation-circle" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.component.version)
                );
              } else {
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Component version is the latest available from the configured repositories"><i class="fa fa-check status-passed" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.component.version)
                );
              }
            } else {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
            }
          },
        },
        {
          title: this.$t('message.group'),
          field: 'component.group',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.vulnerability'),
          field: 'vulnerability.vulnId',
          sortable: true,
          formatter(value, row) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../../vulnerabilities/' +
                row.vulnerability.source +
                '/' +
                value,
            );
            return (
              common.formatSourceLabel(row.vulnerability.source) +
              ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.kev'),
          field: 'vulnerability.isKev',
          sortable: false,
          class: 'tight',
          formatter: (value, row, index) => {
            if (value !== true) {
              return '';
            }
            return this.vueFormatter({
              i18n,
              components: { KevAssertionsModal },
              template: `
                <div class="text-center">
                  <b-link
                    v-b-modal="\`kevAssertionsModal-${index}\`"
                    :title="$t('message.kev_show_assertions')"
                    class="text-danger"
                    style="border-bottom: 1px dashed currentColor; padding-bottom: 3px; cursor: pointer; white-space: nowrap; text-decoration: none;"
                  ><i class="fa fa-crosshairs" /> {{ $t('message.yes') }}</b-link>
                  <kev-assertions-modal :source="source" :vuln-id="vulnId" :index="index"/>
                </div>`,
              data() {
                return {
                  index: index,
                  source: row.vulnerability.source,
                  vulnId: row.vulnerability.vulnId,
                };
              },
            });
          },
        },
        {
          title: this.$t('message.cvss_v2'),
          field: 'vulnerability.cvssV2BaseScore',
          sortable: true,
          visible: false,
          formatter(value) {
            if (Number.isFinite(value)) {
              return value.toFixed(1);
            } else {
              return null;
            }
          },
        },
        {
          title: this.$t('message.cvss_v3'),
          field: 'vulnerability.cvssV3BaseScore',
          sortable: true,
          formatter(value) {
            if (Number.isFinite(value)) {
              return value.toFixed(1);
            } else {
              return null;
            }
          },
        },
        {
          title: this.$t('message.cvss_v4'),
          field: 'vulnerability.cvssV4Score',
          sortable: true,
          formatter(value) {
            if (Number.isFinite(value)) {
              return value.toFixed(1);
            } else {
              return null;
            }
          },
        },
        {
          title: this.$t('message.epss'),
          field: 'vulnerability.epssScore',
          sortable: true,
        },
        {
          title: this.$t('message.epss_percentile'),
          field: 'vulnerability.epssPercentile',
          sortable: true,
        },
        {
          title: this.$t('message.suppressed'),
          field: 'analysis.isSuppressed',
          sortable: true,
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
        toolbar: '#epssToolbar',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage && localStorage.getItem('ProjectEpssPageSize') !== null
            ? Number(localStorage.getItem('ProjectEpssPageSize'))
            : 10,
        sortName:
          localStorage && localStorage.getItem('ProjectEpssSortName') !== null
            ? localStorage.getItem('ProjectEpssSortName')
            : 'vulnerability.epssScore',
        sortOrder:
          localStorage && localStorage.getItem('ProjectEpssSortOrder') !== null
            ? localStorage.getItem('ProjectEpssSortOrder')
            : 'desc',
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          return applyTotalCountHeaders(res, xhr, this);
        },
        url: this.apiUrl(),
        onPostBody: () => {
          this.vueFormatterInit();
          this.initializeTooltips();
        },
        onPageChange: (_, size) => {
          if (localStorage) {
            localStorage.setItem('ProjectEpssPageSize', size.toString());
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectEpssShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('ProjectEpssSortName', name);
            localStorage.setItem('ProjectEpssSortOrder', order);
          }
        },
      },
    };
  },
  methods: {
    apiUrl: function () {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}`;
      return common.setQueryParams(url, {
        epssFrom: 0,
        suppressed: this.showSuppressedFindings === true,
        isKev: this.showKevOnly === true ? true : null,
        totalCount: 'BOUNDED',
      });
    },
    persistFilter: function (key, value) {
      if (localStorage) {
        localStorage.setItem(key, value.toString());
      }
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        pageNumber: 1,
        silent: true,
      });
    },
    tableLoaded: function (data) {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectEpss',
        this.$refs.table.columns,
      );
      const boundedTotal = this.$refs.table.getOptions().boundedTotal;
      this.$emit('total', boundedTotal ? `${boundedTotal}+` : data.total);
      this.$refs.chartEpssVsCvss.render(data);
    },
    initializeTooltips: function () {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
  },
  computed: {
    allFilterDefs() {
      return [
        {
          name: 'showKevOnly',
          label: this.$t('message.kev'),
          icon: 'fa-crosshairs',
        },
        {
          name: 'showSuppressedFindings',
          label: this.$t('message.show_suppressed_findings'),
          icon: 'fa-eye',
        },
      ];
    },
  },
  watch: {
    showSuppressedFindings(value) {
      this.persistFilter('ProjectEpssShowSuppressedFindings', value);
    },
    showKevOnly(value) {
      this.persistFilter('ProjectEpssShowKevOnly', value);
    },
  },
};
</script>
