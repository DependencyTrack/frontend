<template>
  <div>
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
import xssFilters from 'xss-filters';
import BootstrapToggle from 'vue-bootstrap-toggle';
import permissionsMixin from '../../../mixins/permissionsMixin';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';

export default {
  props: {
    uuid: String,
  },
  mixins: [bootstrapTableMixin, permissionsMixin],
  components: {
    BootstrapToggle,
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('message.name'),
          field: 'vulnId',
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../vulnerabilities/' + row.source + '/' + value,
            );
            return (
              common.formatSourceLabel(row.source) +
              ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.aliases'),
          field: 'aliases',
          visible: false,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              let label = '';
              const aliases = common.resolveVulnAliases(row.source, value);
              for (let i = 0; i < aliases.length; i++) {
                let alias = aliases[i];
                let url = xssFilters.uriInUnQuotedAttr(
                  '../../vulnerabilities/' + alias.source + '/' + alias.vulnId,
                );
                label +=
                  common.formatSourceLabel(alias.source) +
                  ` <a href="${url}">${xssFilters.inHTMLData(
                    alias.vulnId,
                  )}</a>`;
                if (i < aliases.length - 1) label += '<br/><br/>';
              }
              return label;
            }
          },
        },
        {
          title: this.$t('message.published'),
          field: 'published',
          sortable: true,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              return common.formatTimestamp(value);
            }
          },
        },
        {
          title: this.$t('message.cwe'),
          field: 'cwes',
          sortable: false,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              let s = '';
              for (let i = 0; i < value.length; i++) {
                let cwe = value[i];
                if (i > 0) {
                  s += ',&nbsp;&nbsp;&nbsp;';
                }
                s += `CWE-${cwe.cweId}`;
              }
              return s;
            }
          },
        },
        {
          title: this.$t('message.severity'),
          field: 'severity',
          sortable: false,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              return common.formatSeverityLabel(value);
            }
          },
        },
        {
          title: this.$t('message.analysis'),
          field: 'analysis.state',
          sortable: false,
          class: 'tight',
          visible: false,
          formatter: common.makeAnalysisStateLabelFormatter(this),
        },
        {
          title: this.$t('message.suppressed'),
          field: 'analysis.isSuppressed',
          sortable: false,
          class: 'tight',
          visible: false,
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.cvss'),
          field: 'cvssV3BaseScore',
          sortable: true,
          visible: false,
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
          field: 'epssScore',
          sortable: true,
          visible: false,
        },
        {
          title: this.$t('message.epss_percentile'),
          field: 'epssPercentile',
          sortable: true,
          visible: false,
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
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage &&
          localStorage.getItem('ComponentVulnerabilitiesPageSize') !== null
            ? Number(localStorage.getItem('ComponentVulnerabilitiesPageSize'))
            : 10,
        sortName:
          localStorage &&
          localStorage.getItem('ComponentVulnerabilitiesSortName') !== null
            ? localStorage.getItem('ComponentVulnerabilitiesSortName')
            : undefined,
        sortOrder:
          localStorage &&
          localStorage.getItem('ComponentVulnerabilitiesSortOrder') !== null
            ? localStorage.getItem('ComponentVulnerabilitiesSortOrder')
            : undefined,
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: false,
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/component/${this.uuid}`,
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem(
              'ComponentVulnerabilitiesPageSize',
              size.toString(),
            );
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ComponentVulnerabilitiesShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('ComponentVulnerabilitiesSortName', name);
            localStorage.setItem('ComponentVulnerabilitiesSortOrder', order);
          }
        },
      },
    };
  },
  methods: {
    tableLoaded: function (data) {
      loadUserPreferencesForBootstrapTable(
        this,
        'ComponentVulnerabilities',
        this.$refs.table.columns,
      );
      if (data && Object.prototype.hasOwnProperty.call(data, 'total')) {
        this.$emit('total', data.total);
      } else {
        this.$emit('total', '?');
      }
    },
  },
};
</script>
