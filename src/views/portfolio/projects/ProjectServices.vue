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
import $ from 'jquery';
import Vue from 'vue';
import common from '../../../shared/common';
import SeverityProgressBar from '../../components/SeverityProgressBar';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';

export default {
  mixins: [permissionsMixin],
  props: {
    uuid: String,
  },
  data() {
    return {
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../../services/' + row.uuid,
            );
            return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.authenticated'),
          field: 'authenticated',
          sortable: false,
          align: 'center',
          class: 'tight',
          formatter: function (value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.x_trust_boundary'),
          field: 'crossesTrustBoundary',
          sortable: false,
          align: 'center',
          class: 'tight',
          formatter: function (value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.risk_score'),
          field: 'lastInheritedRiskScore',
          sortable: true,
          class: 'tight',
        },
        {
          title: this.$t('message.vulnerabilities'),
          field: 'metrics',
          sortable: false,
          formatter: function (metrics, row, index) {
            if (typeof metrics === 'undefined') {
              return '-'; // No vulnerability info available
            }

            // Programmatically instantiate SeverityProgressBar Vue component
            let ComponentClass = Vue.extend(SeverityProgressBar);
            let progressBar = new ComponentClass({
              propsData: {
                vulnerabilities: metrics.vulnerabilities,
                critical: metrics.critical,
                high: metrics.high,
                medium: metrics.medium,
                low: metrics.low,
                unassigned: metrics.unassigned,
                $t: this.$t.bind(this),
              },
            });
            progressBar.$mount();
            return progressBar.$el.outerHTML;
          }.bind(this),
        },
      ],
      data: [],
      options: {
        onPostBody: this.initializeTooltips,
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        toolbar: '#servicesToolbar',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage &&
          localStorage.getItem('ProjectServicesPageSize') !== null
            ? Number(localStorage.getItem('ProjectServicesPageSize'))
            : 10,
        sortName:
          localStorage &&
          localStorage.getItem('ProjectServicesSortName') !== null
            ? localStorage.getItem('ProjectServicesSortName')
            : undefined,
        sortOrder:
          localStorage &&
          localStorage.getItem('ProjectServicesSortOrder') !== null
            ? localStorage.getItem('ProjectServicesSortOrder')
            : undefined,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/project/${this.uuid}`,
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem('ProjectServicesPageSize', size.toString());
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectServicesShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('ProjectServicesSortName', name);
            localStorage.setItem('ProjectServicesSortOrder', order);
          }
        },
      },
    };
  },
  methods: {
    initializeTooltips: function () {
      $('[data-toggle="tooltip"]').tooltip();
    },
    removeServices: function () {
      let selections = this.$refs.table.getSelections();
      if (selections.length === 0) return;
      for (let i = 0; i < selections.length; i++) {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/${selections[i].uuid}`;
        this.axios
          .delete(url)
          .then((response) => {
            this.$refs.table.refresh({ silent: true });
            this.$toastr.s(this.$t('message.service_deleted'));
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
      this.$refs.table.uncheckAll();
    },
    tableLoaded: function (data) {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectServices',
        this.$refs.table.columns,
      );
      if (data && Object.prototype.hasOwnProperty.call(data, 'total')) {
        this.$emit('total', data.total);
      } else {
        this.$emit('total', '?');
      }
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        silent: true,
      });
    },
  },
};
</script>
