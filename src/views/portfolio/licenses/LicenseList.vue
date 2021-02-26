<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
  </div>
</template>

<script>
  import common from "../../../shared/common";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import xssFilters from "xss-filters";

  export default {
    components: {
      PortfolioWidgetRow
    },
    data() {
      const router = this.$router;
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.spdx_license_id'),
            field: "licenseId",
            sortable: true,
            formatter: function (value, row, index) {
              const url = xssFilters.uriInUnQuotedAttr(router.resolve({name: 'License', params: {licenseId: value}}).href);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
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
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE}`
        }
      };
    }
  };
</script>
