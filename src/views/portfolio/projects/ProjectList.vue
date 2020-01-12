<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row />
    <div id="projectsToolbar">
      <div class="form-inline" role="form">
        <b-button size="md" variant="outline-primary" v-b-modal.projectCreateProjectModal v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
          <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
        </b-button>
        &nbsp;&nbsp;
        <b-form-checkbox id="showInactiveProjects" @change="refreshTable" v-model="showInactiveProjects" switch
                         name="showInactiveProjects" value="true" unchecked-value="false"> {{ $t('message.show_inactive_projects') }}
        </b-form-checkbox>
      </div>
    </div>
    <bootstrap-table
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
import common from "../../../shared/common";
import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
import ProjectCreateProjectModal from "./ProjectCreateProjectModal";
import SeverityProgressBar from "../../components/SeverityProgressBar";
import xssFilters from "xss-filters";
import permissionsMixin from "../../../mixins/permissionsMixin";

export default {
  mixins: [permissionsMixin],
  components: {
    ProjectCreateProjectModal,
    PortfolioWidgetRow
  },
  methods: {
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      let tag = this.$route.query.tag;
      if (tag) {
        url += "/tag/" + encodeURIComponent(tag);
      }
      if (this.showInactiveProjects === undefined) {
        url += "?excludeInactive=true";
      } else {
        url += "?excludeInactive=" + this.showInactiveProjects;
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
    }
  },
  data() {
    return {
      showInactiveProjects: false,
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
          title: this.$t('message.last_bom_import'),
          field: "lastBomImport",
          sortable: true,
          formatter(timestamp, row, index) {
            return typeof timestamp === "number"
              ? new Date(timestamp).toDateString()
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
        url: this.apiUrl()
      }
    };
  }
};
</script>
