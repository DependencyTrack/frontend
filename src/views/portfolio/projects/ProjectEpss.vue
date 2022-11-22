<template>
  <div>
    <chart-epss-vs-cvss ref="chartEpssVsCvss" chartId="chartEpssVsCvss" class="chart-wrapper" style="height:400px;margin-top:40px;" :height="400" />

    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <div id="epssToolbar" class="bs-table-custom-toolbar">
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showSuppressedFindings" color="primary" v-model="showSuppressedFindings" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_suppressed_findings') }}</span>
    </div>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded">
    </bootstrap-table>
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import common from "../../../shared/common";
import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
import xssFilters from "xss-filters";
import i18n from "../../../i18n";
import permissionsMixin from "../../../mixins/permissionsMixin";
import BootstrapToggle from 'vue-bootstrap-toggle';
import ChartEpssVsCvss from "../../dashboard/ChartEpssVsCvss";

export default {
  props: {
    uuid: String
  },
  mixins: [bootstrapTableMixin],
  components: {
    cSwitch,
    BootstrapToggle,
    ChartEpssVsCvss
  },
  data() {
    return {
      showSuppressedFindings: false,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
      columns: [
        {
          title: this.$t('message.component'),
          field: "component.name",
          sortable: true,
          formatter: (value, row, index) => {
            let url = xssFilters.uriInUnQuotedAttr("../components/" + row.component.uuid);
            let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr("../projects/" + this.uuid + "?dependencyGraph=" + row.component.uuid + "&objectType=COMPONENT")
            return `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` + `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
          }
        },
        {
          title: this.$t('message.version'),
          field: "component.version",
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
          }
        },
        {
          title: this.$t('message.group'),
          field: "component.group",
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
          }
        },
        {
          title: this.$t('message.vulnerability'),
          field: "vulnerability.vulnId",
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr("../vulnerabilities/" + row.vulnerability.source + "/" + value);
            return common.formatSourceLabel(row.vulnerability.source) + ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
          }
        },
        {
          title: this.$t('message.cvss'),
          field: "vulnerability.cvssV3BaseScore",
          sortable: true,
          formatter(value, row, index) {
            if (value && typeof value === 'number') {
              return value.toFixed(1);
            } else {
              return null;
            }
          },
        },
        {
          title: this.$t('message.epss'),
          field: "vulnerability.epssScore",
          sortable: true
        },
        {
          title: this.$t('message.epss_percentile'),
          field: "vulnerability.epssPercentile",
          sortable: true
        },
        {
          title: this.$t('message.suppressed'),
          field: "analysis.isSuppressed",
          sortable: true,
          class: "tight",
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
        sidePagination: 'client',
        toolbar: '#epssToolbar',
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
        url: this.apiUrl()
      }
    };
  },
  methods: {
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}`
      if (this.showSuppressedFindings === undefined) {
        url += "?source=NVD&suppressed=false";
      } else {
        url += "?source=NVD&suppressed=" + this.showSuppressedFindings;
      }
      return url;
    },
    refreshTable: function() {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true
      });
    },
    tableLoaded: function(data) {
      this.$emit('total', data.total);
      this.$refs.chartEpssVsCvss.render(data);
    }
  },
  watch:{
    showSuppressedFindings() {
      this.refreshTable();
    }
  },
};
</script>
