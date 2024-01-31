<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showInactiveProjects" color="primary" v-model="showInactiveProjects" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_inactive_projects') }}</span>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
      @on-post-body="onPostBody">
    </bootstrap-table>
  </div>
</template>

<script>
  import xssFilters from "xss-filters";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import { Switch as cSwitch } from '@coreui/vue';


  export default {
    mixins: [permissionsMixin],
    components: {
      cSwitch
    },
    beforeCreate() {
      this.showInactiveProjects = (localStorage && localStorage.getItem("AffectedProjectListShowInactiveProjects") !== null) ? (localStorage.getItem("AffectedProjectListShowInactiveProjects") === "true") : false;
    },
    props: {
      source: String,
      vulnId: String,
      vulnerability: String
    },
    data() {
      return {
        showInactiveProjects: this.showInactiveProjects,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter: (value, row) => {
              const url = this.$router.resolve({name: 'Project Vulnerability Lookup',
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
          },
          {
            title: this.$t('message.active'),
            field: "active",
            formatter(value) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
            align: "center",
            sortable: true
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
          toolbar: '#projectsToolbar',
          icons: {
            refresh: 'fa-refresh'
          },
          url: this.apiUrl()
        }
      };
    },
    methods: {
      apiUrl: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/source/${this.source}/vuln/${this.vulnId}/projects`;
        if (this.showInactiveProjects === undefined) {
          url += "?excludeInactive=true";
        } else {
          url += "?excludeInactive=" + !this.showInactiveProjects;
        }
        return url;
      },
      tableLoaded: function(array) {
        this.$emit('total', array.length);
      },
      refreshTable: function () {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true,
          pageNumber: 1
        });
      },
      onPostBody: function () {
        this.$refs.table.hideLoading();
      }
    },
    watch: {
      showInactiveProjects() {
        if (localStorage) {
          localStorage.setItem("AffectedProjectListShowInactiveProjects", this.showInactiveProjects.toString());
        }
        this.$refs.table.showLoading();
        this.currentPage = 1;
        this.refreshTable();
      },
    }
  };
</script>
