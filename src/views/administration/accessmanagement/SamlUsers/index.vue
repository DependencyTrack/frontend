<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button variant="primary" @click="showCreateSamlUserModal = true">
          <span class="fa fa-plus"></span> {{ $t('admin.create_user') }}
        </b-button>
      </div>
      <token-paginated-table
        ref="table"
        :base-url="tableDataBaseUrl"
        :columns="columns"
        :options="options"
      />
    </b-card-body>
    <create-saml-user-modal
      v-model="showCreateSamlUserModal"
      v-on:refreshTable="refreshTable"
    />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../../shared/common';
import bootstrapTableMixin from '../../../../mixins/bootstrapTableMixin';
import EventBus from '../../../../shared/eventbus';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import CreateSamlUserModal from '../CreateSamlUserModal.vue';
import UserDetails from './UserDetails.vue';

export default {
  name: 'SamlUsersView',
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    TokenPaginatedTable,
    CreateSamlUserModal,
  },
  mounted() {
    EventBus.on(this.rowEvents.update, (index, row) => {
      const table = this.$refs.table.$refs.table;
      table.updateRow({ index, row });
      table.expandRow(index);
    });
    EventBus.on(this.rowEvents.delete, () => {
      this.refreshTable();
    });
  },
  beforeUnmount() {
    EventBus.off(this.rowEvents.update);
    EventBus.off(this.rowEvents.delete);
  },
  data() {
    return {
      showCreateSamlUserModal: false,
      searchText: null,
      rowEvents: {
        update: 'admin:samlusers:rowUpdate',
        delete: 'admin:samlusers:rowDeleted',
      },
      columns: [
        {
          title: this.$t('message.username'),
          field: 'username',
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.email'),
          field: 'email',
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.teams'),
          field: 'teams',
          formatter(value) {
            return value ? value.length : 0;
          },
        },
      ],
      options: {
        search: true,
        onSearch: (text) => {
          this.searchText = text;
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.cell(UserDetails, {
            row,
            index,
            rowEvents: this.rowEvents,
          });
        },
        onExpandRow: this.mountCells,
        toolbar: '#customToolbar',
      },
    };
  },
  computed: {
    tableDataBaseUrl() {
      const baseUrl = `${this.$api.BASE_URL}/${this.$api.URL_SAML_USER}`;
      if (!this.searchText) {
        return baseUrl;
      }
      return common.setQueryParams(baseUrl, { q: this.searchText });
    },
  },
  methods: {
    refreshTable: function () {
      this.$refs.table.refreshCurrentPage();
    },
  },
};
</script>
