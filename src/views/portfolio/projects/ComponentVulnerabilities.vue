<template>
  <div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      v-on:onLoadSuccess="tableLoaded">
    </bootstrap-table>
  </div>
</template>

<script>
  import common from "../../../shared/common";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import xssFilters from "xss-filters";
  import BootstrapToggle from 'vue-bootstrap-toggle'
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    props: {
      uuid: String
    },
    mixins: [bootstrapTableMixin, permissionsMixin],
    components: {
      BootstrapToggle
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "vulnId",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../../vulnerabilities/" + row.source + "/" + value);
              return common.formatSourceLabel(row.source) + ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.published'),
            field: "published",
            sortable: true,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatTimestamp(value);
              }
            }
          },
          {
            title: this.$t('message.cwe'),
            field: "cwe",
            sortable: false,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return `CWE-${value.cweId} ${value.name}`;
              }
            }
          },
          {
            title: this.$t('message.severity'),
            field: "severity",
            sortable: false,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatSeverityLabel(value);
              }
            }
          },
          {
            title: this.$t('message.analysis'),
            field: "analysis.state",
            sortable: false,
            class: "tight",
            visible: false,
            formatter: common.makeAnalysisStateLabelFormatter(this),
          },
          {
            title: this.$t('message.suppressed'),
            field: "analysis.isSuppressed",
            sortable: false,
            class: "tight",
            visible: false,
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
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
          detailView: false,
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/component/${this.uuid}`
        }
      };
    },
    methods: {
      tableLoaded: function(data) {
        if (data && Object.prototype.hasOwnProperty.call(data, "total")) {
          this.$emit('total', data.total);
        } else {
          this.$emit('total', '?');
        }
      }
    }
  };
</script>
