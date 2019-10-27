<template>
  <div class="animated fadeIn">
    <portfolio-widget-row />
    <BootstrapTable
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    ></BootstrapTable>
  </div>
</template>

<script>
//import axios from "axios";
import api from "../../../shared/api";
import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";

export default {
  components: {
    PortfolioWidgetRow
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

            if (metrics.vulnerabilities === 0) {
              return '<span class="progress"><div class="progress-bar" style="width: 100%">0</div></span>';
            }

            return `
            <span class="progress">
              ${
                metrics.critical > 0
                  ? `<div class="progress-bar severity-critical-bg" style="width:${(100 *
                      metrics.critical) /
                      metrics.vulnerabilities}%">${metrics.critical}</div>`
                  : ""
              }
              ${
                metrics.high > 0
                  ? `<div class="progress-bar severity-high-bg" style="width:${(100 *
                      metrics.high) /
                      metrics.vulnerabilities}%">${metrics.high}</div>`
                  : ""
              }
              ${
                metrics.medium > 0
                  ? `<div class="progress-bar severity-medium-bg" style="width:${(100 *
                      metrics.medium) /
                      metrics.vulnerabilities}%">${metrics.medium}</div>`
                  : ""
              }
              ${
                metrics.low > 0
                  ? `<div class="progress-bar severity-low-bg" style="width:${(100 *
                      metrics.low) /
                      metrics.vulnerabilities}%">${metrics.low}</div>`
                  : ""
              }
            </span>
            `;
          }
        }
      ],
      data: [],
      options: {
        search: true,
        showColumns: true,
        url: `${api.BASE_URL}/${api.URL_PROJECT}`,
        ajaxOptions: {
          beforeSend: function(xhr) {
            xhr.setRequestHeader(
              "Authorization",
              `Bearer ${sessionStorage.getItem("token")}`
            );
          }
        }
      }
    };
    // mounted() {
    //   axios
    //     .get(`${api.BASE_URL}/${api.URL_PROJECT}`, {
    //       headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    //     })
    //     .then(result => {
    //       this.data = result.data;
    //       console.log(this.data);
    //     });
    // }
  }
};
</script>

<style>
.severity-critical-bg {
  background: var(--severity-critical, red);
}
.severity-high-bg {
  background: var(--severity-high, orange);
}
.severity-medium-bg {
  background: var(--severity-medium, yellow);
}
.severity-low-bg {
  background: var(--severity-low, green);
}
</style>
