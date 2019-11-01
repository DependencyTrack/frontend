<template>
  <div class="animated fadeIn">
    <portfolio-widget-row />
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
  </div>
</template>

<script>
//import axios from "axios";
import Vue from 'vue'
import api from "../../../shared/api";
import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
import SeverityProgressBar from "../../components/SeverityProgressBar";

export default {
  components: {
    PortfolioWidgetRow,
    SeverityProgressBar
  },
  data() {
    return {
      columns: [
        {
          title: "Project Name",
          field: "name",
          sortable: true
        },
        {
          title: "Version",
          field: "version",
          sortable: true
        },
        {
          title: "Last BOM Import",
          field: "lastBomImport",
          sortable: true,
          formatter(timestamp, row, index) {
            return typeof timestamp === "number"
              ? new Date(timestamp).toDateString()
              : "-";
          }
        },
        {
          title: "BOM Format",
          field: "lastBomImportFormat",
          sortable: true
        },
        {
          title: "Risk Score",
          field: "metrics.inheritedRiskScore",
          sortable: true
        },
        {
          title: "Active",
          field: "active",
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : "";
          },
          align: "center",
          sortable: true
        },
        {
          title: "Vulnerabilities",
          field: "metrics",
          sortable: true,
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
        url: `${api.BASE_URL}/${api.URL_PROJECT}`,
      }
    };
  }
};
</script>
