<template>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded">
    </bootstrap-table>
</template>

<script>
  import xssFilters from "xss-filters";
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    mixins: [permissionsMixin],
    props: {
      source: String,
      vulnId: String
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../../projects/" + row.uuid);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true,
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
          url: `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/source/${this.source}/vuln/${this.vulnId}/projects`
        }
      };
    },
    methods: {
      tableLoaded: function(array) {
        this.$emit('total', array.length);
      }
    }
  };
</script>
