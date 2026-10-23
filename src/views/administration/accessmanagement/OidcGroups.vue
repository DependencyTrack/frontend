<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button
          variant="outline-primary"
          @click="showCreateOidcGroupModal = true"
        >
          <span class="fa fa-plus"></span>
          {{ $t('admin.create_oidc_group') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options"
      ></bootstrap-table>
    </b-card-body>
    <create-oidc-group-modal
      v-model="showCreateOidcGroupModal"
      v-on:refreshTable="refreshTable"
    />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../shared/common';
import CreateOidcGroupModal from './CreateOidcGroupModal.vue';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import EventBus from '../../../shared/eventbus';
import OidcGroupDetails from './OidcGroupDetails.vue';

export default {
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    CreateOidcGroupModal,
  },
  mounted() {
    EventBus.on('admin:oidcgroups:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.on('admin:oidcgroups:rowDeleted', () => {
      this.refreshTable();
    });
  },
  beforeUnmount() {
    EventBus.off('admin:oidcgroups:rowUpdate');
    EventBus.off('admin:oidcgroups:rowDeleted');
  },
  data() {
    return {
      showCreateOidcGroupModal: false,
      columns: [
        {
          title: this.$t('admin.oidc_group_name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
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
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.cell(OidcGroupDetails, { row, index });
        },
        onExpandRow: this.mountCells,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}`,
      },
    };
  },
  methods: {
    refreshTable: function () {
      this.$refs.table.refresh({
        silent: true,
      });
    },
  },
};
</script>
