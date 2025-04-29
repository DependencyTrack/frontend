<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar" style="display: flex; align-items: center;">
      <c-switch
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showInactiveProjects"
        color="primary"
        v-model="showInactiveProjects"
        label
        v-bind="labelIcon"
      />
      <span class="text-muted" style="margin-right: 1rem;">
        {{ $t('message.show_inactive_projects') }}
      </span>
      <b-button
        size="md"
        variant="outline-primary"
        v-b-modal.bulkUpdateModal
        v-permission="PERMISSIONS.SYSTEM_CONFIGURATION"
        @click="getSelectedRows"
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

    getSelectedRows() {
      const selectedRows = this.$refs.table.getSelections(); // Get the selected rows
      this.selectedProjects = selectedRows;
    },

    // Method for receiving update from modal and calling API.
    handleBulkApply(payload) {

      this.refreshTable();
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
