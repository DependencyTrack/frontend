<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p class="text-muted">
        {{ $t('admin.workload_identity_providers_description') }}
      </p>
      <div id="customToolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-b-modal.createWorkloadIdentityProviderModal
        >
          <span class="fa fa-plus"></span> {{ $t('message.create') }}
        </b-button>
      </div>
      <token-paginated-table
        ref="table"
        :base-url="tableDataBaseUrl"
        :columns="columns"
        :options="options"
      />
    </b-card-body>
    <create-workload-identity-provider-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../../shared/common';
import bootstrapTableMixin from '../../../../mixins/bootstrapTableMixin';
import EventBus from '../../../../shared/eventbus';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import WorkloadIdentityProviderDetails from './WorkloadIdentityProviderDetails.vue';
import CreateWorkloadIdentityProviderModal from '../CreateWorkloadIdentityProviderModal.vue';

export default {
  name: 'WorkloadIdentityProvidersView',
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    TokenPaginatedTable,
    CreateWorkloadIdentityProviderModal,
  },
  mounted() {
    EventBus.$on(this.rowEvents.update, (index, row) => {
      const table = this.$refs.table.$refs.table;
      table.updateRow({ index, row, replace: true });
      table.expandRow(index);
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
    const textFormatter = (value) =>
      xssFilters.inHTMLData(common.valueWithDefault(value, ''));
    return {
      searchText: null,
      rowEvents: {
        update: 'admin:workloadidentityproviders:rowUpdate',
        delete: 'admin:workloadidentityproviders:rowDeleted',
      },
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          formatter: textFormatter,
        },
        {
          title: this.$t('message.type'),
          field: 'type',
          class: 'tight',
          formatter: textFormatter,
        },
        {
          title: this.$t('admin.workload_identity_issuer'),
          field: 'issuer',
          formatter: textFormatter,
        },
        {
          title: this.$t('admin.workload_identity_audience'),
          field: 'audience',
          formatter: textFormatter,
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
          return this.vueFormatter({
            render: () => (
              <WorkloadIdentityProviderDetails
                row={row}
                index={index}
                rowEvents={this.rowEvents}
              />
            ),
          });
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#customToolbar',
      },
    };
  },
  computed: {
    tableDataBaseUrl() {
      const baseUrl = `${this.$api.BASE_URL}/${this.$api.URL_WORKLOAD_IDENTITY_PROVIDER}`;
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
