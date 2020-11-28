<template>
  <div>
    <div id="toolbar">
      <div class="form-inline btn-spaced-group" role="form">
        <b-button size="md" variant="outline-primary"
                  v-b-modal.projectAddComponentModal
                  v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
          <span class="fa fa-plus"></span> {{ $t('message.add_component') }}
        </b-button>
        <b-button size="md" variant="outline-primary"
                  @click="removeDependencies"
                  v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">
          <span class="fa fa-minus"></span> {{ $t('message.remove_component') }}
        </b-button>
        <b-button size="md" variant="outline-primary"
                  v-b-modal.projectUploadBomModal
                  v-permission:or="[PERMISSIONS.PORTFOLIO_MANAGEMENT, PERMISSIONS.BOM_UPLOAD]">
          <span class="fa fa-upload"></span> {{ $t('message.upload_bom') }}
        </b-button>
      </div>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      v-on:onLoadSuccess="tableLoaded">
    </bootstrap-table>
    <project-upload-bom-modal :uuid="this.uuid" />
    <project-add-component-modal :uuid="this.uuid" v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
  import $ from 'jquery';
  import Vue from 'vue'
  import common from "../../../shared/common";
  import SeverityProgressBar from "../../components/SeverityProgressBar";
  import xssFilters from "xss-filters";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import ProjectAddComponentModal from "@/views/portfolio/projects/ProjectAddComponentModal";
  import ProjectUploadBomModal from "@/views/portfolio/projects/ProjectUploadBomModal";

  export default {
    components: {ProjectUploadBomModal, ProjectAddComponentModal},
    mixins: [permissionsMixin],
    comments: {
      ProjectAddComponentModal,
      ProjectUploadBomModal,
    },
    props: {
      uuid: String
    },
    data() {
      const router = this.$router;
      return {
        columns: [
          {
            field: "state",
            checkbox: true,
            align: "center"
          },
          {
            title: this.$t('message.component'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              const url = xssFilters.uriInUnQuotedAttr(router.resolve({name: 'Component', params: {uuid: row.uuid}}).href);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true,
            formatter(value, row, index) {
              if (Object.prototype.hasOwnProperty.call(row, "repositoryMeta") && Object.prototype.hasOwnProperty.call(row.repositoryMeta, "latestVersion")) {
                row.latestVersion = row.repositoryMeta.latestVersion;
                if (row.repositoryMeta.latestVersion !== row.version) {
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Outdated component. Current version is: '+ xssFilters.inHTMLData(row.repositoryMeta.latestVersion) + '"><i class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.version);
                } else {
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Component version is the latest available from the configured repositories"><i class="fa fa-exclamation-triangle status-passed" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.version);
                }
              } else {
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
          },
          {
            title: this.$t('message.latest_version'),
            field: "latestVersion",
            sortable: false,
            visible: false,
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
                const licenseurl = xssFilters.uriInUnQuotedAttr(router.resolve({name: 'License', params: {licenseId: row.resolvedLicense.licenseId}}).href);
                return "<a href=\"" + licenseurl + "\">" + xssFilters.inHTMLData(row.resolvedLicense.licenseId) + "</a>";
              } else {
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
            }
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
          toolbar: '#toolbar',
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
          url: `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/project/${this.uuid}`
        }
      };
    },
    methods: {
      initializeTooltips: function () {
        $('[data-toggle="tooltip"]').tooltip();
      },
      removeDependencies: function () {
        let selections = this.$refs.table.getSelections();
        if (selections.length === 0) return;
        for (let i=0; i<selections.length; i++) {
          let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${selections[i].uuid}`;
          this.axios.delete(url).then((response) => {
            this.$refs.table.refresh({ silent: true });
            this.$toastr.s(this.$t('message.component_deleted'));
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
