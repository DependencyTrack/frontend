<template>
  <div>
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
import $ from 'jquery';
import Vue from 'vue'
import common from "../../../shared/common";
import SeverityProgressBar from "../../components/SeverityProgressBar";
import xssFilters from "xss-filters";
import permissionsMixin from "../../../mixins/permissionsMixin";

export default {
  mixins: [permissionsMixin],
  props: {
    uuid: String
  },
  data() {
    return {
      columns: [
        {
          field: "state",
          checkbox: true,
          align: "center"
        },
        {
          title: this.$t('message.name'),
          field: "name",
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr("../../../services/" + row.uuid);
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
          title: this.$t('message.authenticated'),
          field: "authenticated",
          sortable: false,
          align: "center",
          class: "tight",
          formatter: function (value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : "";
          },
        },
        {
          title: this.$t('message.x_trust_boundary'),
          field: "crossesTrustBoundary",
          sortable: false,
          align: "center",
          class: "tight",
          formatter: function (value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : "";
          },
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
        onPostBody: this.initializeTooltips,
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        toolbar: '#servicesToolbar',
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
        url: `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/project/${this.uuid}`
      }
    };
  },
  methods: {
    initializeTooltips: function () {
      $('[data-toggle="tooltip"]').tooltip();
    },
    removeServices: function () {
      let selections = this.$refs.table.getSelections();
      if (selections.length === 0) return;
      for (let i=0; i<selections.length; i++) {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/${selections[i].uuid}`;
        this.axios.delete(url).then((response) => {
          this.$refs.table.refresh({ silent: true });
          this.$toastr.s(this.$t('message.service_deleted'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      }
      this.$refs.table.uncheckAll();
    },
    tableLoaded: function(data) {
      if (data && Object.prototype.hasOwnProperty.call(data, "total")) {
        this.$emit('total', data.total);
      } else {
        this.$emit('total', '?');
      }
    },
    refreshTable: function() {
      this.$refs.table.refresh({
        silent: true
      });
    }
  }
};
</script>
