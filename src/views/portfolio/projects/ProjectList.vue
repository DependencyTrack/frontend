<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" v-b-modal.projectCreateProjectModal v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
        <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
      </b-button>
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showInactiveProjects" color="primary" v-model="showInactiveProjects" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_inactive_projects') }}</span>
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showHierarchy" color="primary" v-model="showHierarchy" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.hierarchical_view') }}</span>
    </div>
    <bootstrap-table class="animated fadeIn"
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
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
  import bootstrapTableMixin from "@/mixins/bootstrapTableMixin";

  let api;
  let route;
  let showInactiveProjects;
  let columns;

  function vueFormatterObject (index, row){
    return {
      template: `
              <bootstrap-table ref="table" :columns="columns" :data="data" :options="options"></bootstrap-table>
              `,
      mixins: [permissionsMixin, bootstrapTableMixin],
      methods: {
        apiUrl: function (uuid) {
          let url = `${api.BASE_URL}/${api.URL_PROJECT}/${uuid}/children`;
          let tag = route.query.tag;
          if (tag) {
            url += "/tag/" + encodeURIComponent(tag);
          }
          let classifier = route.query.classifier;
          if (classifier) {
            url += "/classifier/" + encodeURIComponent(classifier);
          }
          if (showInactiveProjects === undefined) {
            url += "?excludeInactive=true";
          } else {
            url += "?excludeInactive=" + !showInactiveProjects;
          }
          return url;
        },
      },
      data(){
        return{
          columns: columns,
          data: [],
          options: {
            url: this.apiUrl(row.uuid),
            sidePagination: 'server',
            queryParamsType: 'pageSize',
            detailView: true,
            detailFilter: detailFilter,
            detailFormatter: (index, row) => {
              return this.vueFormatter(vueFormatterObject(index, row));
            },
            onExpandRow: this.vueFormatterInit
          }
        }
      }

    }
  }

  function detailFilter(index, row){
    return (row.hasOwnProperty('children') && row.children)
  }

  export default {
    mixins: [permissionsMixin, bootstrapTableMixin],
    components: {
      cSwitch,
      ProjectCreateProjectModal,
      PortfolioWidgetRow
    },
    mounted() {
      showInactiveProjects = this.showInactiveProjects;
      api = this.$api;
      route = this.$route;
      columns = this.columns;
    },
    methods: {
      apiUrl: function () {
        let url;
        api = this.$api;
        route = this.$route;
        if (this.showHierarchy){
          url = `${api.BASE_URL}/${api.URL_PROJECT}/root`;
        }else{
          url = `${api.BASE_URL}/${api.URL_PROJECT}`;
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
        return url;
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      }
    },
    watch:{
      $route (to, from) {
        this.refreshTable();
      },
      showInactiveProjects() {
        showInactiveProjects = !showInactiveProjects
        this.refreshTable();
      },
      showHierarchy(){
        this.options.detailView = !this.options.detailView;
        this.options.url = this.apiUrl();
      }
    },
    data() {
      return {
        showInactiveProjects: false,
        showHierarchy: false,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        columns: [
          {
            title: this.$t('message.project_name'),
            field: "name",
            sortable: true,
            widthUnit: '%',
            width: '15.23',
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../projects/" + row.uuid);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true,
            widthUnit: '%',
            width: '10,27',
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.classifier'),
            field: "classifier",
            sortable: true,
            widthUnit: '%',
            width: '8.96',
            formatter: common.componentClassifierLabelProjectUrlFormatter(this),
          },
          {
            title: this.$t('message.last_bom_import'),
            field: "lastBomImport",
            sortable: true,
            widthUnit: '%',
            width: '14.71',
            formatter(timestamp, row, index) {
              return typeof timestamp === "number"
                ? common.formatTimestamp(timestamp, true)
                : "-";
            }
          },
          {
            title: this.$t('message.bom_format'),
            field: "lastBomImportFormat",
            sortable: true,
            widthUnit: '%',
            width: '11.14',
          },
          {
            title: this.$t('message.risk_score'),
            field: "lastInheritedRiskScore",
            sortable: true,
            widthUnit: '%',
            width: '9.75',
          },
          {
            title: this.$t('message.active'),
            field: "active",
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
            align: "center",
            sortable: true,
            widthUnit: '%',
            width: '7.40',
          },
          {
            title: this.$t('message.policy_violations'),
            field: "metrics",
            widthUnit: '%',
            width: '11.84',
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
            widthUnit: '%',
            width: '10.70',
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
          detailView: false,
          detailFilter: detailFilter,
          detailFormatter: (index, row) => {
            return this.vueFormatter(vueFormatterObject(index, row))
          },
          onExpandRow: this.vueFormatterInit,
          search: true,
          showColumns: true,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'server',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          pageNumber: 1,
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
  };
</script>
