<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" v-b-modal.projectCreateProjectModal v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
        <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
      </b-button>
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showInactiveProjects" color="primary" v-model="showInactiveProjects" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_inactive_projects') }}</span>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="initializeChildren"
      @on-post-body="onPostBody">
    </bootstrap-table>
    <project-create-project-modal v-on:refreshTable="refreshTable"/>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Switch as cSwitch } from '@coreui/vue';
  import common from "../../../shared/common";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import ProjectCreateProjectModal from "./ProjectCreateProjectModal";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import PolicyViolationProgressBar from "../../components/PolicyViolationProgressBar";
  import xssFilters from "xss-filters";
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    mixins: [permissionsMixin],
    components: {
      cSwitch,
      ProjectCreateProjectModal,
      PortfolioWidgetRow
    },
    methods: {
      apiUrl: function (uuid) {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
        if (uuid){
          url += `/${uuid}/children`
        }
        let tag = this.$route.query.tag;
        if (tag) {
          url += "/tag/" + encodeURIComponent(tag);
        }
        let classifier = this.$route.query.classifier;
        if (classifier) {
          url += "/classifier/" + encodeURIComponent(classifier);
        }
        if (this.showInactiveProjects === undefined) {
          url += "?excludeInactive=true";
        } else {
          url += "?excludeInactive=" + !this.showInactiveProjects;
        }
        if (!uuid){
          url += "&onlyRoot=true"
        }
        return url;
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      },
      onPostBody: function() {
        let columns = this.$refs.table.getOptions().columns

        if (columns && columns[0][1].visible) {
          this.$refs.table.$table.treegrid({
            treeColumn: 0,
            initialState: 'collapsed',
          })
        }
        this.$refs.table.getData().forEach(row => {
          if (Object.prototype.hasOwnProperty.call(row, "expanded") && row.expanded){
            this.$refs.table.$table.find('tbody').find('tr.treegrid-' + row.id.toString() + '.treegrid-collapsed').treegrid('expand')
          }
        })
      },
      initializeChildren: async function (data) {
        let children = []
        for (const project of data) {
          if (Object.prototype.hasOwnProperty.call(project, 'children')) {
            let url = this.apiUrl(project.uuid)
            await this.axios.get(url).then((response) => {
              children.push(...response.data)
            })
          }
        }
        this.$refs.table.$table.bootstrapTable('append', children)
      },
      getGrandChildren: async function (children) {
        let data = []
        for (const child of children) {
          let url = this.apiUrl(child.uuid)
          await this.axios.get(url).then((response) => {
            data.push(...response.data)
          })
        }
        this.$refs.table.$table.bootstrapTable('append', data)
      }
    },
    watch:{
      $route (to, from) {
        this.refreshTable();
      },
      showInactiveProjects() {
        this.refreshTable();
      }
    },
    data() {
      return {
        showInactiveProjects: false,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        columns: [
          {
            title: this.$t('message.project_name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../projects/" + row.uuid);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.classifier'),
            field: "classifier",
            sortable: true,
            formatter: common.componentClassifierLabelProjectUrlFormatter(this),
          },
          {
            title: this.$t('message.last_bom_import'),
            field: "lastBomImport",
            sortable: true,
            formatter(timestamp, row, index) {
              return typeof timestamp === "number"
                ? common.formatTimestamp(timestamp, true)
                : "-";
            }
          },
          {
            title: this.$t('message.bom_format'),
            field: "lastBomImportFormat",
            sortable: true
          },
          {
            title: this.$t('message.risk_score'),
            field: "lastInheritedRiskScore",
            sortable: true
          },
          {
            title: this.$t('message.active'),
            field: "active",
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
            align: "center",
            sortable: true
          },
          {
            title: this.$t('message.policy_violations'),
            field: "metrics",
            formatter: function (metrics) {
              if (typeof metrics === "undefined") {
                return "-"; // No vulnerability info available
              }
              let ComponentClass = Vue.extend(PolicyViolationProgressBar);
              let progressBar = new ComponentClass({
                propsData: {
                  metrics,
                  $t: this.$t.bind(this),
                }
              });
              progressBar.$mount();
              return progressBar.$el.outerHTML;
            }.bind(this)
          },
          {
            title: this.$t('message.vulnerabilities'),
            field: "metrics",
            sortable: false,
            formatter(metrics, row, index) {
              if (typeof metrics === "undefined") {
                return "-"; // No vulnerability info available
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
                  unassigned: metrics.unassigned }
              });
              progressBar.$mount();
              return progressBar.$el.outerHTML;
            }
          }
        ],
        data: [],
        options: {
          idField: 'id',
          parentIdField: 'pid',
          treeShowField: 'name',
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
          toolbar: '#projectsToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: this.apiUrl(),
          // onClickRow is used instead of a tree node's onExpand event, because onExpand does not pass any arguments and therefore makes it complicated to retrieve a row's data which is needed for fetching its children
          onClickRow: ((row, $element, value) => {
            if (!$element.treegrid('isLeaf') && $element.treegrid('isExpanded')){
              if (Object.prototype.hasOwnProperty.call(row, 'children') && !Object.prototype.hasOwnProperty.call(row, 'expanded')){
                $element.treegrid('collapse')
                this.getGrandChildren(row.children)
              }
              row.expanded = true
            } else if (!$element.treegrid('isLeaf') && $element.treegrid('isCollapsed')){
              row.expanded = false
            }
          }),
        }
      };
    }
  };
</script>
