<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <portfolio-widget-row :fetch="true" />
    <div id="licensesToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" v-b-modal.licenseAddLicenseModal v-permission="PERMISSIONS.SYSTEM_CONFIGURATION">
        <span class="fa fa-plus"></span> {{ $t('message.add_license') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
    <license-add-license-modal v-on:refreshTable="refreshTable"/>
  </div>
</template>

<script>
  import common from "../../../shared/common";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import xssFilters from "xss-filters";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import LicenseAddLicenseModal from "@/views/portfolio/licenses/LicenseAddLicenseModal";

  export default {
    mixins: [permissionsMixin],
    components: {
      LicenseAddLicenseModal,
      PortfolioWidgetRow
    },
    methods: {
      refreshTable: function () {
        this.$refs.table.refresh({
          url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE}`,
          silent: true
        })
      }
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.spdx_license_id'),
            field: "licenseId",
            sortable: true,
            formatter: function (value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../licenses/" + encodeURIComponent(value));
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            },
          },
          {
            title: this.$t('message.osi_approved'),
            field: "isOsiApproved",
            sortable: false,
            align: "center",
            class: "tight",
            formatter: function (value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          },
          {
            title: this.$t('message.fsf_libre'),
            field: "isFsfLibre",
            sortable: false,
            align: "center",
            class: "tight",
            formatter: function (value, row, index) {
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
          toolbar: '#licensesToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE}`
        }
      };
    }
  };
</script>
