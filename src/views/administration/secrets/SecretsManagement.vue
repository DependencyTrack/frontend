<template>
  <b-card no-body :header="$t('admin.secrets_management')">
    <b-card-body>
      <div id="customToolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-if="canCreate"
          v-b-modal.createSecretModal
        >
          <span class="fa fa-plus"></span> {{ $t('message.create') }}
        </b-button>
      </div>
      <token-paginated-table
        ref="table"
        :base-url="tableDataBaseUrl"
        :columns="columns"
        :data="data"
        :options="options"
      >
      </token-paginated-table>
    </b-card-body>
    <create-secret-modal v-on:refreshTable="refreshTable" />
    <update-secret-modal
      v-on:refreshTable="refreshTable"
      :secret="selectedRow"
    />
  </b-card>
</template>

<script>
import common from '../../../shared/common';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import permissionsMixin from '@/mixins/permissionsMixin';
import routerMixin from '@/mixins/routerMixin';
import systemCapabilitiesMixin from '@/mixins/systemCapabilitiesMixin';
import xssFilters from 'xss-filters';
import CreateSecretModal from '@/views/administration/secrets/CreateSecretModal.vue';
import UpdateSecretModal from '@/views/administration/secrets/UpdateSecretModal.vue';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';

export default {
  mixins: [
    bootstrapTableMixin,
    permissionsMixin,
    routerMixin,
    systemCapabilitiesMixin,
  ],
  props: {
    header: String,
  },
  components: {
    TokenPaginatedTable,
    CreateSecretModal,
    UpdateSecretModal,
  },
  data() {
    return {
      selectedRow: null,
      searchText: null,
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          formatter(value) {
            return xssFilters.inHTMLData(value);
          },
        },
        {
          title: this.$t('message.description'),
          field: 'description',
          sortable: false,
          searchable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, '-'));
          },
        },
        {
          title: this.$t('message.created'),
          field: 'created_at',
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
        {
          title: this.$t('message.updated'),
          field: 'updated_at',
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
        {
          title: this.$t('message.actions'),
          align: 'center',
          formatter: () => {
            return `
              <button class="btn btn-sm btn-outline-primary action-btn" data-action="edit" title=${JSON.stringify(this.$t('admin.edit_secret'))} ${!this.canUpdate ? 'disabled' : ''}>
                <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger action-btn" data-action="delete" title=${JSON.stringify(this.$t('admin.delete_secret'))} ${!this.canDelete ? 'disabled' : ''}>
                <i class="fa fa-trash"></i>
              </button>
            `;
          },
          events: {
            'click .action-btn': (event, _, row) => {
              const action = event.currentTarget.dataset.action;
              switch (action) {
                case 'edit':
                  this.onEditClicked(row);
                  break;
                case 'delete':
                  this.onDeleteClicked(row);
                  break;
              }
            },
          },
        },
      ],
      data: [],
      options: {
        search: true,
        searchable: false,
        showColumns: true,
        showRefresh: true,
        silentSort: false,
        onSearch: (text) => {
          this.searchText = text;
        },
        queryParams: function () {
          // Don't send any query parameters for now,
          // since pagination happens on the client
          // and server-side filtering is not (yet) supported.
          return {};
        },
        icons: {
          refresh: 'fa-refresh',
        },
        toolbar: '#customToolbar',
      },
    };
  },
  computed: {
    isReadOnly() {
      return this.systemCapabilities?.secret_management?.read_only !== false;
    },
    canCreate() {
      return (
        !this.isReadOnly &&
        (this.isPermitted(this.PERMISSIONS.SECRET_MANAGEMENT) ||
          this.isPermitted(this.PERMISSIONS.SECRET_MANAGEMENT_CREATE))
      );
    },
    canUpdate() {
      return (
        !this.isReadOnly &&
        (this.isPermitted(this.PERMISSIONS.SECRET_MANAGEMENT) ||
          this.isPermitted(this.PERMISSIONS.SECRET_MANAGEMENT_UPDATE))
      );
    },
    canDelete() {
      return (
        !this.isReadOnly &&
        (this.isPermitted(this.PERMISSIONS.SECRET_MANAGEMENT) ||
          this.isPermitted(this.PERMISSIONS.SECRET_MANAGEMENT_DELETE))
      );
    },
    tableDataBaseUrl() {
      const baseUrl = `${this.$api.BASE_URL}/api/v2/secrets`;
      if (!this.searchText) {
        return baseUrl;
      }
      return common.setQueryParams(baseUrl, { q: this.searchText });
    },
  },
  methods: {
    onEditClicked(row) {
      this.selectedRow = row;
      this.$nextTick(() => {
        this.$bvModal.show('updateSecretModal');
      });
    },
    onDeleteClicked(row) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('admin.confirm_secret_deletion_message', { name: row.name }),
          {
            title: this.$t('admin.confirm_secret_deletion'),
            size: 'md',
            okVariant: 'danger',
            okTitle: this.$t('message.delete'),
            cancelTitle: this.$t('message.cancel'),
            centered: true,
          },
        )
        .then((confirmed) => {
          if (confirmed) {
            this.deleteSecret(row.name);
          }
        });
    },
    deleteSecret(name) {
      this.axios
        .delete(
          `${this.$api.BASE_URL}/api/v2/secrets/${encodeURIComponent(name)}`,
        )
        .then(() => {
          this.$toastr.s(
            this.$t('message.record_deleted_message'),
            this.$t('message.record_deleted_title'),
          );
          this.refreshTable();
        });
    },
    refreshTable: function () {
      this.$refs.table.refreshCurrentPage();
    },
  },
};
</script>
