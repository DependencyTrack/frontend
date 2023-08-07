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
      vulnId: String,
      vulnerability: String
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter: (value, row, index) => {
              let url = xssFilters.uriInUnQuotedAttr("../../../projects/" + row.uuid + "/findings/" + row.affectedComponent + "/" + this.vulnerability);
              let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr("../../../projects/" + row.uuid + "/dependencyGraph/" + row.affectedComponent)
              return row.directDependencies ? `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` + `<a href="${url}">${xssFilters.inHTMLData(value)}</a>` : `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
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
