<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" @click="initializeProjectCreateProjectModal" v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
        <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
      </b-button>
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showInactiveProjects" color="primary" v-model="showInactiveProjects" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_inactive_projects') }}</span>
      <c-switch @click.native="saveViewState" style="margin-left:1rem; margin-right:.5rem" id="showFlatView" color="primary" v-model="showFlatView" label v-bind="labelIcon" :disabled="isSearching" v-b-tooltip.hover :title="$t('message.switch_view')" /><span class="text-muted">{{ $t('message.show_flat_view') }}</span>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="onLoadSuccess"
      @on-pre-body="onPreBody"
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
  import MurmurHash2 from "imurmurhash"
  import {loadUserPreferencesForBootstrapTable} from "@/shared/utils";

  export default {
    mixins: [permissionsMixin],
    components: {
      cSwitch,
      ProjectCreateProjectModal,
      PortfolioWidgetRow
    },
    beforeCreate() {
      this.showInactiveProjects = (localStorage && localStorage.getItem("ProjectListShowInactiveProjects") !== null) ? (localStorage.getItem("ProjectListShowInactiveProjects") === "true") : false;
      this.showFlatView = (localStorage && localStorage.getItem("ProjectListShowFlatView") !== null) ? (localStorage.getItem("ProjectListShowFlatView") === "true") : false;
    },
    methods: {
      initializeProjectCreateProjectModal: function () {
        this.$root.$emit("initializeProjectCreateProjectModal");
      },
      apiUrl: function (uuid) {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
        if (uuid) {
          url += `/${uuid}/children`;
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
        if (this.isSearching) {
          url += "&onlyRoot=false";
        } else {
          if (this.showFlatView === undefined) {
            url += "&onlyRoot=true";
          } else {
            url += "&onlyRoot=" + !this.showFlatView;
          }
        }
        return url;
      },
      refreshTable: function () {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      },
      onLoadSuccess: function () {
        loadUserPreferencesForBootstrapTable(this, "ProjectList", this.$refs.table.columns);
      },
      onPreBody: function () {
        this.$refs.table.getData().forEach(project => {
          project.id = MurmurHash2(project.uuid).result();
        })
      },
      onPostBody: function () {
        if (!this.showFlatView && !this.isSearching) {
          let columns = this.$refs.table.getOptions().columns;

          if (columns && columns[0][0].visible) {
            this.$refs.table.$table.treegrid({
              treeColumn: 0,
              initialState: 'collapsed',
            })
          }
          this.$refs.table.getData().forEach(project => {
            if (project.children && !project.fetchedChildren && (this.showInactiveProjects || project.children.some(child => child.active))
              && (!this.$route.query.classifier || project.children.some(child => child.classifier === this.$route.query.classifier))
              && (!this.$route.query.tag || project.children.some(child => child.tag === this.$route.query.tag))) {
              this.$refs.table.$table.find('tbody').find('tr.treegrid-' + project.id.toString()).addClass('treegrid-collapsed');
              this.$refs.table.$table.find('tbody').find('tr.treegrid-' + project.id.toString()).treegrid('renderExpander');
            }
          })
          this.$refs.table.getData().forEach(row => {
            if (row.expanded) {
              this.$refs.table.$table.find('tbody').find('tr.treegrid-' + row.id.toString()).treegrid('expand');
            } else if (row.expanded === false) {
              this.$refs.table.$table.find('tbody').find('tr.treegrid-' + row.id.toString()).treegrid('collapse');
            }
          })
        }
        this.$refs.table.hideLoading();
      },
      getChildren: async function (project) {
        let url = this.apiUrl(project.uuid);
        await this.axios.get(url).then((response) => {
          for (let project of response.data) {
            if (project.parent) {
              project.pid = MurmurHash2(project.parent.uuid).result();
            }
          }
          this.$refs.table.append(response.data);
        })
      },
      saveViewState: function () {
        this.savedViewState = this.showFlatView;
      }
    },
    watch: {
      $route(to, from) {
        this.refreshTable();
      },
      showInactiveProjects() {
        if (localStorage) {
          localStorage.setItem("ProjectListShowInactiveProjects", this.showInactiveProjects.toString());
        }
        this.$refs.table.showLoading()
        this.refreshTable();
      },
      showFlatView() {
        if (localStorage) {
          localStorage.setItem("ProjectListShowFlatView", this.showFlatView.toString());
        }
        this.$refs.table.showLoading();
        this.refreshTable();
      },
      isSearching() {
        this.refreshTable();
      }
    },
    data() {
      return {
        showInactiveProjects: this.showInactiveProjects,
        showFlatView: this.showFlatView,
        isSearching: false,
        savedViewState: null,
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
                  unassigned: metrics.unassigned
                }
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
          pageSize: (localStorage && localStorage.getItem("ProjectListPageSize") !== null) ? Number(localStorage.getItem("ProjectListPageSize")) : 10,
          sortName: (localStorage && localStorage.getItem("ProjectListSortName") !== null) ? localStorage.getItem("ProjectListSortName") : undefined,
          sortOrder: (localStorage && localStorage.getItem("ProjectListSortOrder") !== null) ? localStorage.getItem("ProjectListSortOrder") : undefined,
          icons: {
            refresh: 'fa-refresh'
          },
          toolbar: '#projectsToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: this.apiUrl(),
          // onClickRow is used instead of a tree node's onExpand event, because onExpand does not pass any arguments and therefore makes it complicated to retrieve a row's data which is needed for fetching its children and appending the data
          onClickRow: ((row, $element) => {
            if (!this.showFlatView && !this.isSearching) {
              if (event.target.tagName.toLowerCase() !== 'a' && $element.treegrid('isLeaf') && row.children && !row.fetchedChildren && (this.showInactiveProjects || row.children.some(child => child.active))
                && (!this.$route.query.classifier || row.children.some(child => child.classifier === this.$route.query.classifier))
                && (!this.$route.query.tag || row.children.some(child => child.tag === this.$route.query.tag))) {
                row.fetchedChildren = true;
                this.getChildren(row);
                row.expanded = true;
              } else if (event.target.tagName.toLowerCase() !== 'a' && ((!$element.treegrid('isLeaf') && $element.treegrid('isCollapsed') && event.target.className !== "treegrid-expander treegrid-expander-collapsed") || event.target.className === "treegrid-expander treegrid-expander-expanded")) {
                $element.treegrid('expand');
                row.expanded = true;
              } else if (event.target.tagName.toLowerCase() !== 'a' && ((!$element.treegrid('isLeaf') && $element.treegrid('isExpanded') && event.target.className !== "treegrid-expander treegrid-expander-expanded") || event.target.className === "treegrid-expander treegrid-expander-collapsed")) {
                $element.treegrid('collapse');
                row.expanded = false;
              }
            }
          }),
          onSearch: ((text) => {
            this.isSearching = text.length !== 0
            if (this.isSearching) {
              this.showFlatView = true;
            } else {
              if (this.savedViewState !== null) {
                this.showFlatView = !this.savedViewState;
              } else {
                this.showFlatView = false;
              }
            }
          }),
          onPageChange: ((number, size) => {
            if (localStorage) {
              localStorage.setItem("ProjectListPageSize", size.toString());
            }
          }),
          onColumnSwitch: ((field, checked) => {
            if (localStorage) {
              localStorage.setItem("ProjectListShow" + common.capitalize(field), checked.toString());
            }
          }),
          onSort: ((name, order) => {
            if (localStorage) {
              localStorage.setItem("ProjectListSortName", name);
              localStorage.setItem("ProjectListSortOrder", order);
            }
          })
        }
      };
    }
  };
</script>
