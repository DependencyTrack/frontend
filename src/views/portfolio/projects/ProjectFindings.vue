<template>
  <div>
    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <div id="findingsToolbar" class="bs-table-custom-toolbar">
      <b-button id="apply-vex-button" size="md" variant="outline-primary"
                v-b-modal.projectUploadVexModal
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <span class="fa fa-upload"></span> {{ $t('message.apply_vex') }}
      </b-button>
      <b-tooltip target="apply-vex-button" triggers="hover focus">{{ $t('message.apply_vex_tooltip') }}</b-tooltip>

      <b-button id="export-vex-button" size="md" variant="outline-primary"
                @click="downloadVex()"
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <span class="fa fa-download"></span> {{ $t('message.export_vex') }}
      </b-button>
      <b-tooltip target="export-vex-button" triggers="hover focus">{{ $t('message.export_vex_tooltip') }}</b-tooltip>

      <b-button id="export-vdr-button" size="md" variant="outline-primary"
                @click="downloadVdr()"
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <span class="fa fa-download"></span> {{ $t('message.export_vdr') }}
      </b-button>
      <b-tooltip target="export-vdr-button" triggers="hover focus">{{ $t('message.export_vdr_tooltip') }}</b-tooltip>

      <b-button id="reanalyze-button" size="md" variant="outline-primary"
                @click="reAnalyze()"
                v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY]">
        <span class="fa fa-refresh"></span> {{ $t('message.project_reanalyze') }}
      </b-button>
      <b-tooltip target="reanalyze-button" triggers="hover focus">{{ $t('message.project_reanalyze_tooltip') }}</b-tooltip>


      <!-- Future use when CSAF support is added
      <b-dropdown variant="outline-primary" v-permission:or="[PERMISSIONS.VIEW_VULNERABILITY, PERMISSIONS.VULNERABILITY_ANALYSIS]">
        <template #button-content>
          <span class="fa fa-download"></span> {{ $t('message.export_vex') }}
        </template>
        <b-dropdown-item @click="downloadVex('cyclonedx')" href="#">CycloneDX</b-dropdown-item>
        <b-dropdown-item @click="downloadVex('csaf')" href="#">CSAF</b-dropdown-item>
      </b-dropdown>
      -->
      <c-switch style="margin-left:1rem; margin-right:.5rem" id="showSuppressedFindings" color="primary" v-model="showSuppressedFindings" label v-bind="labelIcon" /><span class="text-muted">{{ $t('message.show_suppressed_findings') }}</span>
    </div>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded">
    </bootstrap-table>

    <project-upload-vex-modal :uuid="this.uuid" />
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import $ from "jquery";
import xssFilters from "xss-filters";

import common from "@/shared/common";
import i18n from "@/i18n";
import { compareVersions, loadUserPreferencesForBootstrapTable } from "@/shared/utils";
import bootstrapTableMixin from "@/mixins/bootstrapTableMixin";
import permissionsMixin from "@/mixins/permissionsMixin";
import FindingAudit from "./FindingAudit";
import ProjectUploadVexModal from "./ProjectUploadVexModal";

  export default {
    props: {
      uuid: String
    },
    mixins: [
      bootstrapTableMixin,
      permissionsMixin
    ],
    components: {
      cSwitch,
      ProjectUploadVexModal
    },
    beforeCreate() {
      this.showSuppressedFindings = (localStorage && localStorage.getItem("ProjectFindingsShowSuppressedFindings") !== null) ? (localStorage.getItem("ProjectFindingsShowSuppressedFindings") === "true") : false;
    },
    data() {
      return {
        showSuppressedFindings: this.showSuppressedFindings,
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
              let url = xssFilters.uriInUnQuotedAttr("../../../components/" + row.component.uuid);
              let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr("../../../projects/" + this.uuid + "/dependencyGraph/" + row.component.uuid)
              return `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` + `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "component.version",
            sortable: true,
            formatter(value, row, index) {
              if (Object.prototype.hasOwnProperty.call(row.component, "latestVersion")) {
                if (compareVersions(row.component.latestVersion, row.component.version) > 0) {
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Outdated component. Current version is: '+ xssFilters.inHTMLData(row.component.latestVersion) + '"><i class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.component.version);
                } else if (compareVersions(row.component.latestVersion, row.component.version) < 0) {
                  // should be unstable then
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Unstable component. Current stable version is: '+ xssFilters.inHTMLData(row.component.latestVersion) + '"><i class="fa fa-exclamation-circle" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.component.version);
                } else {
                  return '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Component version is the latest available from the configured repositories"><i class="fa fa-check status-passed" aria-hidden="true"></i></span> ' + xssFilters.inHTMLData(row.component.version);
                }
              } else {
                return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
              }
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
              let url = xssFilters.uriInUnQuotedAttr("../../../vulnerabilities/" + row.vulnerability.source + "/" + value);
              return common.formatSourceLabel(row.vulnerability.source) + ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.aliases'),
            field: "vulnerability.aliases",
            visible: false,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                let label = "";
                const aliases = common.resolveVulnAliases(row.vulnerability.source, value);
                for (let i=0; i<aliases.length; i++) {
                  let alias = aliases[i];
                  let url = xssFilters.uriInUnQuotedAttr("../../../vulnerabilities/" + alias.source + "/" + alias.vulnId);
                  label += common.formatSourceLabel(alias.source) + ` <a href="${url}">${xssFilters.inHTMLData(alias.vulnId)}</a>`
                  if (i < aliases.length-1) label += "<br/><br/>"
                }
                return label;
              }
            }
          },
          {
            title: this.$t('message.cwe'),
            field: "vulnerability.cwes",
            sortable: true,
            visible: false,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                let label = "";
                for (let i=0; i<value.length; i++) {
                  label += common.formatCweShortLabel(value[i].cweId, value[i].name);
                  if (i < value.length-1) label += ", "
                }
                return label;
              }
            }
          },
          {
            title: this.$t('message.severity'),
            field: "vulnerability.severity",
            sortName: "vulnerability.severityRank",
            sortable: true,
            formatter(value, row, index) {
              if (typeof value !== 'undefined') {
                return common.formatSeverityLabel(value);
              }
            }
          },
          {
            title: this.$t('message.analyzer'),
            field: "attribution.analyzerIdentity",
            sortable: true,
            formatter(value, row, index) {
              return common.formatAnalyzerLabel(row.attribution.analyzerIdentity, row.vulnerability.source, row.vulnerability.vulnId,
                row.attribution.alternateIdentifier, row.attribution.referenceUrl);
            }
          },
          {
            title: this.$t('message.attributed_on'),
            field: "attribution.attributedOn",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.formatTimestamp(value));
            }
          },
          {
            title: this.$t('message.analysis'),
            field: "analysis.state",
            sortable: true,
            formatter: common.makeAnalysisStateLabelFormatter(this),
          },
          {
            title: this.$t('message.suppressed'),
            field: "analysis.isSuppressed",
            sortable: true,
            class: "tight",
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          },
          {
            title: this.$t('message.matrix'),
            field: "matrix",
            sortable: true,
            visible: false
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
          sidePagination: 'client',
          toolbar: '#findingsToolbar',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: (localStorage && localStorage.getItem("ProjectFindingsPageSize") !== null) ? Number(localStorage.getItem("ProjectFindingsPageSize")) : 10,
          sortName: (localStorage && localStorage.getItem("ProjectFindingsSortName") !== null) ? localStorage.getItem("ProjectFindingsSortName") : undefined,
          sortOrder: (localStorage && localStorage.getItem("ProjectFindingsSortOrder") !== null) ? localStorage.getItem("ProjectFindingsSortOrder") : undefined,
          searchText: this.$route.params.vulnerability ? ":" + this.$route.params.vulnerability : undefined,
          icons: {
            detailOpen: 'fa-fw fa-angle-right',
            detailClose: 'fa-fw fa-angle-down',
            refresh: 'fa-refresh'
          },
          detailView: true,
          detailViewIcon: true,
          detailViewByClick: false,
          detailFormatter: (index, row) => {
            return row && this.vueFormatter({
              i18n,
              propsData: {
                finding: row,
                projectUuid: this.uuid
              },
              ...FindingAudit
            })
          },
          onExpandRow: this.vueFormatterInit,
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: this.apiUrl(),
          onPageChange: ((number, size) => {
            if (localStorage) {
              localStorage.setItem("ProjectFindingsPageSize", size.toString())
            }
          }),
          onColumnSwitch: ((field, checked) => {
            if (localStorage) {
              localStorage.setItem("ProjectFindingsShow"+common.capitalize(field), checked.toString())
            }
          }),
          onSort: ((name, order) => {
            if (localStorage) {
              localStorage.setItem("ProjectFindingsSortName", name);
              localStorage.setItem("ProjectFindingsSortOrder", order);
            }
          })
        }
      };
    },
    methods: {
      apiUrl: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}`
        if (this.showSuppressedFindings === undefined) {
          url += "?suppressed=false";
        } else {
          url += "?suppressed=" + this.showSuppressedFindings;
        }
        return url;
      },
      downloadVex: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_VEX}/cyclonedx/project/${this.uuid}`;
        this.axios.request({
          responseType: 'blob',
          url: url,
          method: 'get',
          params: {
            download: 'true'
          }
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          let filename = "vex.json";
          let disposition = response.headers["content-disposition"]
          if (disposition && disposition.indexOf('attachment') !== -1) {
            let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            let matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        });
      },
      downloadVdr: function () {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_BOM}/cyclonedx/project/${this.uuid}`;
        this.axios.request({
          responseType: 'blob',
          url: url,
          method: 'get',
          params: {
            format: 'json',
            variant: 'vdr',
            download: 'true'
          }
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          let filename = "bom.json";
          let disposition = response.headers["content-disposition"]
          if (disposition && disposition.indexOf('attachment') !== -1) {
            let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            let matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        });
      },
      reAnalyze: function (data) {
        let analyzeUrl = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}/analyze`
        this.axios.post(analyzeUrl).then((response) => {
          this.$toastr.s(this.$t('message.project_reanalyze_requested'));
          //ignore token from response, don't wait for completion
          this.refreshTable();
        });
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          pageNumber: 1,
          silent: true
        });
      },
      tableLoaded: function(data) {
        loadUserPreferencesForBootstrapTable(this, "ProjectFindings", this.$refs.table.columns);
        this.$emit('total', data.total);
        if (this.$route.params.vulnerability) {
          this.$refs.table.expandRow(0);
        }
      },
      initializeTooltips: function () {
        $('[data-toggle="tooltip"]').tooltip({
          trigger: "hover"
        });
      },
    },
    watch:{
      showSuppressedFindings() {
        if (localStorage) {
          localStorage.setItem("ProjectFindingsShowSuppressedFindings", this.showSuppressedFindings.toString());
        }
        this.refreshTable();
      }
    },
  };
</script>
