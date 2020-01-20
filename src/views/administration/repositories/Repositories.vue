<template>
  <b-card no-body :header="header">
    <b-card-body>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";

  export default {
    props: {
      header: String,
      type: String
    },
    methods: {
      apiUrl: function () {
        return `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.type}?orderBy=resolutionOrder&sort=asc`;
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      }
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('admin.identifier'),
            field: "identifier",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.url'),
            field: "url",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.enabled'),
            field: "enabled",
            class: "tight",
            sortable: true,
            formatter(value, row, index) {
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
          sidePagination: 'client',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          toolbar: '#projectsToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: this.apiUrl()
        }
      };
    }
  }
</script>
