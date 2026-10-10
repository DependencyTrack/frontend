<template>
  <b-modal
    id="selectProjectModal"
    size="lg"
    hide-header-close
    no-stacking
    v-permission="'VIEW_PORTFOLIO'"
    :title="$t('message.select_project')"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button size="md" variant="primary" @click="handleSelection">{{
        $t('message.select')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';

export default {
  mixins: [permissionsMixin],
  props: {
    // Current projects should be a list of UUIDs since names can be duplicate
    username: { type: String, default: null },
  },
  methods: {
    apiUrl: function () {
      let endpoint;
      if (this.username) {
        endpoint = `${this.$api.BASE_URL}/${this.$api.URL_ACL_USER}/${this.username}`;
        return endpoint;
      }

      endpoint = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      if (this.showInactiveProjects === undefined) {
        endpoint += '?excludeInactive=true';
      } else {
        endpoint += '?excludeInactive=' + !this.showInactiveProjects;
      }
      return endpoint;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        pageNumber: 1,
        silent: true,
      });
    },
    handleSelection: function () {
      this.$root.$emit('bv::hide::modal', this.$children[0].id);
      this.$emit('selection', this.$refs.table.getSelections());
    },
  },
  watch: {
    showInactiveProjects() {
      this.refreshTable();
    },
  },
  data() {
    return {
      showInactiveProjects: false,
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
          title: this.$t('message.project_name'),
          field: 'name',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
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
        {
          title: this.$t('message.active'),
          field: 'active',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
          align: 'center',
          class: 'tight',
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
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
        icons: {
          refresh: 'fa-refresh',
        },
        toolbar: '#projectsToolbar',
        responseHandler: (res, xhr) => {
          // console.log(this.currentProjects);
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
      },
    };
  },
};
</script>
