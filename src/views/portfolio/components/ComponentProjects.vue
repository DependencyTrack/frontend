<template>
  <bootstrap-table
    ref="table"
    :columns="columns"
    :data="data"
    :options="options">
  </bootstrap-table>
</template>

<script>
  import common from "../../../shared/common";
  import xssFilters from "xss-filters";

  export default {
    props: {
      uuid: String
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "project.name",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../../projects/" + row.project.uuid);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "project.version",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
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
          url: `${this.$api.BASE_URL}/${this.$api.URL_DEPENDENCY}/component/${this.uuid}`
        }
      };
    }
  };
</script>
