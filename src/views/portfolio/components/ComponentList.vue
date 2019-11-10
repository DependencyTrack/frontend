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
  import Vue from 'vue'
  import api from "../../../shared/api";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import xssFilters from "xss-filters";

  export default {
    components: {
      PortfolioWidgetRow
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              let componenturl = xssFilters.uriInUnQuotedAttr("../components/" + row.uuid);
              return `<a href="${componenturl}">${value}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true
          },
          {
            title: this.$t('message.group'),
            field: "group",
            sortable: true
          },
          {
            title: this.$t('message.license'),
            field: "license",
            sortable: false
          },
          {
            title: this.$t('message.risk_score'),
            field: "lastInheritedRiskScore",
            sortable: true,
            class: "tight",
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
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${api.BASE_URL}/${api.URL_COMPONENT}`
        }
      };
    }
  };
</script>
