<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('admin.select_project')"
  >
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-form-checkbox
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showInactiveProjects"
        v-model="showInactiveProjects"
        switch
        ><span class="text-muted">{{
          $t('message.show_inactive_projects')
        }}</span></b-form-checkbox
      >
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button
        variant="primary"
        @click="$emit('selection', $refs.table.getSelections())"
        >{{ $t('message.select') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import router from '@/router';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  props: {
    teamUuid: String,
  },
  emits: ['selection'],
  data() {
    return {
      showInactiveProjects: false,
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.project_name'),
          field: 'name',
          sortable: true,
          formatter(value, row) {
            // TODO: Close modal when link is clicked.
            const href = router.resolve({
              name: 'Project',
              params: { uuid: row.uuid },
            }).fullPath;
            return `<a href="${href}">${xssFilters.inHTMLData(value)}</a>`;
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      data: [],
      options: {
        clickToSelect: true,
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
          refresh: 'fa-refresh',
        },
        toolbar: '#projectsToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
      },
    };
  },
  methods: {
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}?notAssignedToTeamWithUuid=${this.teamUuid}`;
      if (this.showInactiveProjects === undefined) {
        url += '&excludeInactive=true';
      } else {
        url += '&excludeInactive=' + !this.showInactiveProjects;
      }
      return url;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true,
      });
    },
  },
  watch: {
    showInactiveProjects() {
      this.refreshTable();
    },
  },
};
</script>
