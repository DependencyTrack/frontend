<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row />
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
  </div>
</template>

<script>
  import api from "../../../shared/api";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import xssFilters from "xss-filters";

  export default {
    components: {
      PortfolioWidgetRow
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true
          },
          {
            title: this.$t('message.spdx_license_id'),
            field: "licenseId",
            sortable: true,
            formatter: function (value, row, index) {
              let licenseurl = xssFilters.uriInUnQuotedAttr("../license/?licenseId=" + value);
              return `<a href="${licenseurl}">${value}</a>`;
            },
          },
          {
            title: this.$t('message.osi_approved'),
            field: "isOsiApproved",
            sortable: false,
            align: "center",
            class: "tight",
            formatter: function (value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          },
          {
            title: this.$t('message.fsf_libre'),
            field: "isFsfLibre",
            sortable: false,
            align: "center",
            class: "tight",
            formatter: function (value, row, index) {
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
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader(`${api.TOTAL_COUNT_HEADER}`);
            return res;
          },
          url: `${api.BASE_URL}/${api.URL_LICENSE}`
        }
      };
    }
  };
</script>
