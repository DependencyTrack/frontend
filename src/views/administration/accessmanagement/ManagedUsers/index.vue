<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-b-modal.createManagedUserModal
        >
          <span class="fa fa-plus"></span> {{ $t('admin.create_user') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options"
      >
      </bootstrap-table>
    </b-card-body>
    <create-managed-user-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../../shared/common';
import bootstrapTableMixin from '../../../../mixins/bootstrapTableMixin';
import EventBus from '../../../../shared/eventbus';
import UserDetails from './UserDetails.vue';
import CreateManagedUserModal from '../CreateManagedUserModal.vue';

export default {
  name: 'ManagedUsersView',
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    CreateManagedUserModal,
  },
  mounted() {
    EventBus.$on(this.rowEvents.update, (index, row) => {
      this.$refs.table.updateRow({ index, row });
      this.$refs.table.expandRow(index);
    });
    EventBus.$on(this.rowEvents.delete, () => {
      this.refreshTable();
    });
  },
  beforeDestroy() {
    EventBus.$off(this.rowEvents.update);
    EventBus.$off(this.rowEvents.delete);
  },
  data() {
    return {
      rowEvents: {
        update: 'admin:managedusers:rowUpdate',
        delete: 'admin:managedusers:rowDeleted',
      },
      columns: [
        {
          title: this.$t('message.username'),
          field: 'username',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.fullname'),
          field: 'fullname',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.email'),
          field: 'email',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.teams'),
          field: 'teams',
          sortable: false,
          formatter(value) {
            return value
              ? xssFilters.inHTMLData(
                  common.valueWithDefault(value.length, '0'),
                )
              : 0;
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
          return this.vueFormatter({
            render: (h) =>
              h(UserDetails, {
                props: { row, index, rowEvents: this.rowEvents },
              }),
          });
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`,
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
