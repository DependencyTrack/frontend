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
  import api from "../../../shared/api";
  import common from "../../../shared/common";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
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
            field: "vulnerabilityhref",
            sortable: true
          },
          {
            title: this.$t('message.published'),
            field: "publishedLabel",
            sortable: true
          },
          {
            title: this.$t('message.cwe'),
            field: "cwefield",
            sortable: false
          },
          {
            title: this.$t('message.severity'),
            field: "severityLabel",
            sortable: false
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
            for (let i=0; i<res.length; i++) {
              let vulnurl = xssFilters.uriInUnQuotedAttr("../vulnerability/?source=" + res[i].source + "&vulnId=" + res[i].vulnId);
              res[i].vulnerabilityhref = common.formatSourceLabel(res[i].source) + " <a href=\"" + vulnurl + "\">" + res[i].vulnId + "</a>";
              if (res[i].hasOwnProperty("cwe")) {
                res[i].cwefield = "CWE-" + res[i].cwe.cweId + " " + res[i].cwe.name;
              }
              if (res[i].hasOwnProperty("severity")) {
                res[i].severityLabel = common.formatSeverityLabel(res[i].severity);
              }
              if (res[i].hasOwnProperty("published")) {
                res[i].publishedLabel = common.formatTimestamp(res[i].published);
              }
            }
            return res;
          },
          url: `${api.BASE_URL}/${api.URL_VULNERABILITY}`
        }
      };
    }
  };
</script>
