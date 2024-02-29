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
    <div id="epssToolbar" class="bs-table-custom-toolbar">
      <c-switch
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showSuppressedFindings"
        color="primary"
        v-model="showSuppressedFindings"
        label
        v-bind="labelIcon"
      /><span class="text-muted">{{
        $t('message.show_suppressed_findings')
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
import {
  compareVersions,
  loadUserPreferencesForBootstrapTable,
} from '@/shared/utils';
import { Switch as cSwitch } from '@coreui/vue';
import $ from 'jquery';
import BootstrapToggle from 'vue-bootstrap-toggle';
import xssFilters from 'xss-filters';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import common from '../../../shared/common';
import ChartEpssVsCvss from '../../dashboard/ChartEpssVsCvss';

export default {
  props: {
    uuid: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    cSwitch,
    BootstrapToggle,
    ChartEpssVsCvss,
  },
  beforeCreate() {
    this.showSuppressedFindings =
      localStorage &&
      localStorage.getItem('ProjectEpssShowSuppressedFindings') !== null
        ? localStorage.getItem('ProjectEpssShowSuppressedFindings') === 'true'
        : false;
  },
  data() {
    return {
      showSuppressedFindings: this.showSuppressedFindings,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      columns: [
        {
          title: this.$t('message.component'),
          field: 'component.name',
          sortable: true,
          formatter: (value, row, index) => {
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
          formatter(value, row, index) {
            if (
              Object.prototype.hasOwnProperty.call(
                row.component,
                'latestVersion',
              )
            ) {
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
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.vulnerability'),
          field: 'vulnerability.vulnId',
          sortable: true,
          formatter(value, row, index) {
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
          title: this.$t('message.cvss'),
          field: 'vulnerability.cvssV3BaseScore',
          sortable: true,
          formatter(value, row, index) {
            if (value && typeof value === 'number') {
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
        sidePagination: 'client',
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
            : undefined,
        sortOrder:
          localStorage && localStorage.getItem('ProjectEpssSortOrder') !== null
            ? localStorage.getItem('ProjectEpssSortOrder')
            : undefined,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
        onPostBody: this.initializeTooltips,
        onPageChange: (number, size) => {
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
      let url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}`;
      if (this.showSuppressedFindings === undefined) {
        url += '?source=NVD&suppressed=false';
      } else {
        url += '?source=NVD&suppressed=' + this.showSuppressedFindings;
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
        'ProjectEpss',
        this.$refs.table.columns,
      );
      this.$emit('total', data.total);
      this.$refs.chartEpssVsCvss.render(data);
    },
    initializeTooltips: function () {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
  },
  watch: {
    showSuppressedFindings() {
      if (localStorage) {
        localStorage.setItem(
          'ProjectEpssShowSuppressedFindings',
          this.showSuppressedFindings.toString(),
        );
      }
      this.refreshTable();
    },
  },
};
</script>
