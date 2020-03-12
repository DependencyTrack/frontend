<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <div id="componentsToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" v-b-modal.componentCreateComponentModal v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
        <span class="fa fa-plus"></span> {{ $t('message.create_component') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
    <component-create-component-modal v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import common from "../../../shared/common";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import xssFilters from "xss-filters";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import ComponentCreateComponentModal from "./ComponentCreateComponentModal";

  export default {
    mixins: [permissionsMixin],
    components: {
      PortfolioWidgetRow,
      ComponentCreateComponentModal
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../components/" + row.uuid);
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
            title: this.$t('message.group'),
            field: "group",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.internal'),
            field: "isInternal",
            sortable: false,
            align: "center",
            class: "tight",
            formatter: function (value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          },
          {
            title: this.$t('message.license'),
            field: "license",
            sortable: false,
            formatter(value, row, index) {
              if (Object.prototype.hasOwnProperty.call(row, "resolvedLicense")) {
                let licenseurl = "../licenses/" + row.resolvedLicense.licenseId;
                return "<a href=\"" + licenseurl + "\">" + xssFilters.inHTMLData(row.resolvedLicense.licenseId) + "</a>";
              } else {
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
          },
          {
            title: this.$t('message.used_by'),
            field: "usedBy",
            sortable: false,
            class: "tight",
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
          toolbar: '#componentsToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}`
        }
      };
    },
    methods: {
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          silent: true
        });
      }
    }
  };
</script>
