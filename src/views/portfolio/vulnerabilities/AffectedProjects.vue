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
        {{ $t('Bulk-Update') }}
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
      console.log('Vulnerability:');
      console.log(this.vulnerability);
      // Iterate over each selected project
      for (let i = 0; i < output.selectedProjects.length; i += 1) {
        for (
          let j = 0;
          j < output.selectedProjects[i].affectedComponentUuids.length;
          j += 1
        ) {
          console.log('Project:');
          console.log(output.selectedProjects[i].uuid);
          console.log('Component:');
          console.log(output.selectedProjects[0].affectedComponentUuids[j]);
          this.callRestEndpoint(
            output.selectedProjects[i].uuid,
            output.selectedProjects[i].affectedComponentUuids[j],
            this.vulnerability,
            output.analysisState,
            output.analysisJustification,
            null,
            null,
            output.comment,
            null,
          );
        }
      }
      this.refreshTable();
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
          isSuppressed: null,
        })
        .then((response) => {
          this.$toastr.s(this.$t('message.updated'));
          this.updateAnalysisData(response.data);
        })
        .catch(() => {
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
