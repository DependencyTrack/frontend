<template>
  <b-modal id="selectProjectModal" size="lg" hide-header-close no-stacking :title="$t('admin.select_project')">
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <CSwitch style="margin-left:1rem; margin-right:.5rem" id="showInactiveProjects" color="primary" :checked.sync="showInactiveProjects" label /><span class="text-muted">{{ $t('message.show_inactive_projects') }}</span>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="$emit('selection', $refs.table.getSelections())">{{ $t('message.select') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import { CSwitch } from '@coreui/vue';
import xssFilters from "xss-filters";
import permissionsMixin from "../../../mixins/permissionsMixin";
import common from "../../../shared/common";

export default {
  mixins: [permissionsMixin],
  components: {
    CSwitch
  },
  data() {
    return {
      showInactiveProjects: false,
      columns: [
        {
          field: "state",
          checkbox: true,
          align: "center"
        },
        {
          title: this.$t('message.project_name'),
          field: "name",
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr("../projects/" + row.uuid);
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
        toolbar: '#projectsToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader("X-Total-Count");
          return res;
        },
        url: this.apiUrl()
      }
    };
  },
  methods: {
    apiUrl: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      if (this.showInactiveProjects === undefined) {
        url += "?excludeInactive=true";
      } else {
        url += "?excludeInactive=" + !this.showInactiveProjects;
      }
      return url;
    },
    refreshTable: function() {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true
      });
    }
  },
  watch:{
    showInactiveProjects() {
      this.refreshTable();
    }
  },
}
</script>
