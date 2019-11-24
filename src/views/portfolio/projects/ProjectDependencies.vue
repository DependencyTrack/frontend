<template>
  <bootstrap-table
    ref="table"
    :columns="columns"
    :data="data"
    :options="options">
  </bootstrap-table>
</template>

<script>
  import Vue from 'vue'
  import api from "../../../shared/api";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import xssFilters from "xss-filters";

  export default {
    props: {
      uuid: String
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.component'),
            field: "component.name",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../components/" + row.uuid);
              return `<a href="${url}">${value}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "component.version",
            sortable: true
          },
          {
            title: this.$t('message.group'),
            field: "component.group",
            sortable: true
          },
          {
            title: this.$t('message.license'),
            field: "component.license",
            sortable: false
          },
          {
            title: this.$t('message.risk_score'),
            field: "metrics.inheritedRiskScore",
            sortable: true
          },
          {
            title: this.$t('message.vulnerabilities'),
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
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader(`${api.TOTAL_COUNT_HEADER}`);
            return res;
          },
          url: `${api.BASE_URL}/${api.URL_DEPENDENCY}/project/${this.uuid}`
        }
      };
    }
  };
</script>
