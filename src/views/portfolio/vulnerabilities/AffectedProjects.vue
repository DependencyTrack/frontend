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
            formatter: (value, row) => {
              const url = this.$router.resolve({name: 'Project Finding Lookup',
                  params: {'uuid': row.uuid, vulnerability:this.vulnerability}}).href;

              let html = `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
              if(row.dependencyGraphAvailable) {
                  const dependencyGraphUrl = this.$router.resolve({name: 'Dependency Graph Component Lookup',
                      params: {'uuid': row.uuid,
                        componentUuids: row.affectedComponentUuids.join('|')}}).href;
                  html = `<a href="${dependencyGraphUrl}"><i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` + html
              }

              return html;
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
