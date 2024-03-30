<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <portfolio-widget-row :fetch="true" />
    <div id="licensesToolbar" class="bs-table-custom-toolbar">
      <b-button
        size="md"
        variant="outline-primary"
        v-b-modal.licenseAddLicenseModal
        v-permission="PERMISSIONS.SYSTEM_CONFIGURATION"
      >
        <span class="fa fa-plus"></span> {{ $t('message.add_license') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="onLoadSuccess"
    >
    </bootstrap-table>
    <license-add-license-modal v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
import common from '../../../shared/common';
import PortfolioWidgetRow from '../../dashboard/PortfolioWidgetRow';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import routerMixin from '../../../mixins/routerMixin';
import LicenseAddLicenseModal from '@/views/portfolio/licenses/LicenseAddLicenseModal';
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';

export default {
  mixins: [permissionsMixin, routerMixin],
  components: {
    LicenseAddLicenseModal,
    PortfolioWidgetRow,
  },
  methods: {
    refreshTable: function () {
      this.$refs.table.refresh({
        url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}`,
        silent: true,
      });
    },
    onLoadSuccess: function () {
      loadUserPreferencesForBootstrapTable(
        this,
        'LicenseList',
        this.$refs.table.columns,
      );
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.spdx_license_id'),
          field: 'licenseId',
          sortable: true,
          formatter: function (value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../licenses/' + encodeURIComponent(value),
            );
            return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
          },
        },
        {
          title: this.$t('message.osi_approved'),
          field: 'isOsiApproved',
          sortable: false,
          align: 'center',
          class: 'tight',
          formatter: function (value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.fsf_libre'),
          field: 'isFsfLibre',
          sortable: false,
          align: 'center',
          class: 'tight',
          formatter: function (value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.custom_license'),
          field: 'isCustomLicense',
          sortable: false,
          align: 'center',
          class: 'tight',
          visible: false,
          formatter: function (value, row, index) {
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
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage && localStorage.getItem('LicenseListPageSize') !== null
            ? Number(localStorage.getItem('LicenseListPageSize'))
            : 10,
        sortName:
          localStorage && localStorage.getItem('LicenseListSortName') !== null
            ? localStorage.getItem('LicenseListSortName')
            : undefined,
        sortOrder:
          localStorage && localStorage.getItem('LicenseListSortOrder') !== null
            ? localStorage.getItem('LicenseListSortOrder')
            : undefined,
        searchText: this.$route.query.searchText
          ? this.$route.query.searchText
          : '',
        icons: {
          refresh: 'fa-refresh',
        },
        toolbar: '#licensesToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE}`,
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem('LicenseListPageSize', size.toString());
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'LicenseListShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('LicenseListSortName', name);
            localStorage.setItem('LicenseListSortOrder', order);
          }
        },
        onSearch: (text) => {
          this.setSearchTextQuery(text);
        },
      },
    };
  },
};
</script>
