<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <c-switch
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showInactiveProjects"
        color="primary"
        v-model="showInactiveProjects"
        label
        v-bind="labelIcon"
      /><span class="text-muted">{{
        $t('message.show_inactive_projects')
      }}</span>
      <b-button
        size="md"
        variant="outline-primary"
        v-b-modal.bulkUpdateModal
        v-permission="PERMISSIONS.VULNERABILITY_ANALYSIS"
        @click="updateSelectedRows"
      >
        {{ $t('message.bulk_update') }}
      </b-button>

      <b-button
        size="md"
        variant="outline-warning"
        v-permission="PERMISSIONS.VULNERABILITY_ANALYSIS"
        @click="suppressSelected(true)"
      >
        {{ $t('message.suppress') }}
      </b-button>

      <b-button
        size="md"
        variant="outline-success"
        v-permission="PERMISSIONS.VULNERABILITY_ANALYSIS"
        @click="suppressSelected(false)"
      >
        {{ $t('message.unsuppress') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
      @on-post-body="onPostBody"
    >
    </bootstrap-table>

    <bulk-update-modal
      :selected-projects="selectedProjects"
      @submit-bulk-analysis="handleBulkApply"
      v-on:refreshTable="refreshTable"
    />
  </div>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import { Switch as cSwitch } from '@coreui/vue';
import BulkUpdateModal from '@/views/portfolio/vulnerabilities/BulkUpdateModal.vue';
import common from '@/shared/common';

export default {
  mixins: [permissionsMixin],
  components: {
    cSwitch,
    BulkUpdateModal,
  },
  beforeCreate() {
    this.showInactiveProjects =
      localStorage &&
      localStorage.getItem('AffectedProjectListShowInactiveProjects') !== null
        ? localStorage.getItem('AffectedProjectListShowInactiveProjects') ===
          'true'
        : false;
  },
  props: {
    source: String,
    vulnId: String,
    vulnerability: String,
  },
  data() {
    return {
      showInactiveProjects: this.showInactiveProjects,
      selectedProjects: [],
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter: (value, row) => {
            const url = this.$router.resolve({
              name: 'Project Vulnerability Lookup',
              params: { uuid: row.uuid, vulnerability: this.vulnerability },
            }).href;

            let html = `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            if (row.dependencyGraphAvailable) {
              const dependencyGraphUrl = this.$router.resolve({
                name: 'Dependency Graph Component Lookup',
                params: {
                  uuid: row.uuid,
                  componentUuids: row.affectedComponentUuids.join('|'),
                },
              }).href;
              html =
                `<a href="${dependencyGraphUrl}"><i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` +
                html;
            }

            return html;
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: true,
        },
        {
          title: this.$t('message.active'),
          field: 'active',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
          align: 'center',
          sortable: true,
        },
      ],
      data: [],
      options: {
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
        toolbar: '#projectsToolbar',
        icons: {
          refresh: 'fa-refresh',
        },
        url: this.apiUrl(),
      },
    };
  },
  methods: {
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_VULNERABILITY}/source/${this.source}/vuln/${encodeURIComponent(this.vulnId)}/projects`;
      if (this.showInactiveProjects === undefined) {
        url += '?excludeInactive=true';
      } else {
        url += '?excludeInactive=' + !this.showInactiveProjects;
      }
      return url;
    },
    tableLoaded: function (array) {
      this.$emit('total', array.length);
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true,
        pageNumber: 1,
      });
    },
    onPostBody: function () {
      this.$refs.table.hideLoading();
    },

    updateSelectedRows() {
      this.selectedProjects = this.$refs.table.getSelections();
    },

    // Method for receiving update from modal and calling API.
    handleBulkApply(output) {
      // Iterate over each selected project
      for (const project of output.selectedProjects) {
        for (const component of project.affectedComponentUuids) {
          this.callRestEndpoint(
            project.uuid,
            component,
            this.vulnerability,
            output.analysisState,
            output.analysisJustification,
            output.analysisResponse,
            output.analysisDetails,
            output.comment,
            output.isSuppressed,
          );
        }
      }
      this.refreshTable();
    },

    suppressSelected(suppress) {
      const selected = this.$refs.table.getSelections();
      if (!selected || selected.length === 0) {
        this.$toastr.w(this.$t('message.no_projects_selected'));
        return;
      }
      for (const project of selected) {
        for (const component of project.affectedComponentUuids) {
          this.callRestEndpoint(
            project.uuid,
            component,
            this.vulnerability,
            null, // analysisState
            null, // justification
            null, // response
            null, // details
            null, // comment
            suppress
          );
        }
      }
      this.refreshTable();
    },

    updateAnalysisData: function (analysis) {
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisComments')) {
        let trail = '';
        for (let i = 0; i < analysis.analysisComments.length; i++) {
          if (
            Object.prototype.hasOwnProperty.call(
              analysis.analysisComments[i],
              'commenter',
            )
          ) {
            trail += analysis.analysisComments[i].commenter + ' - ';
          }
          trail += common.formatTimestamp(
            analysis.analysisComments[i].timestamp,
            true,
          );
          trail += '\n';
          trail += analysis.analysisComments[i].comment;
          trail += '\n\n';
        }
        this.auditTrail = trail;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisState')) {
        this.analysisState = analysis.analysisState;
      }
      if (
        Object.prototype.hasOwnProperty.call(analysis, 'analysisJustification')
      ) {
        this.analysisJustification = analysis.analysisJustification;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisResponse')) {
        this.analysisResponse = analysis.analysisResponse;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisDetails')) {
        this.analysisDetails = analysis.analysisDetails;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'isSuppressed')) {
        this.isSuppressed = analysis.isSuppressed;
      } else {
        this.isSuppressed = false;
      }
    },

    callRestEndpoint: function (
      projectUuid,
      componentUuid,
      vulnerabilityUuid,
      analysisState,
      analysisJustification,
      analysisResponse,
      analysisDetails,
      comment,
      isSuppressed,
    ) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_ANALYSIS}`;
      this.axios
        .put(url, {
          project: projectUuid,
          component: componentUuid,
          vulnerability: vulnerabilityUuid,
          analysisState: analysisState,
          analysisJustification: analysisJustification,
          analysisResponse: analysisResponse,
          analysisDetails: analysisDetails,
          comment: comment,
          isSuppressed: isSuppressed,
        })
        .then((response) => {
          this.$toastr.s(this.$t('message.updated'));
          this.updateAnalysisData(response.data);
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },

  watch: {
    showInactiveProjects() {
      if (localStorage) {
        localStorage.setItem(
          'AffectedProjectListShowInactiveProjects',
          this.showInactiveProjects.toString(),
        );
      }
      this.$refs.table.showLoading();
      this.currentPage = 1;
      this.refreshTable();
    },
    vulnId() {
      // update url when vulnId changes, will trigger table refresh
      this.$refs.table.refreshOptions({ ...this.options, url: this.apiUrl() });
    },
  },
};
</script>
