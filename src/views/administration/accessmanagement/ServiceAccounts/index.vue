<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-b-modal.createServiceAccountModal
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
    <create-service-account-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../../shared/common';
import bootstrapTableMixin from '../../../../mixins/bootstrapTableMixin';
import EventBus from '../../../../shared/eventbus';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import ServiceAccountDetails from './ServiceAccountDetails.vue';
import CreateServiceAccountModal from '../CreateServiceAccountModal.vue';

export default {
  name: 'ServiceAccountsView',
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    TokenPaginatedTable,
    CreateServiceAccountModal,
  },
  mounted() {
    EventBus.$on(this.rowEvents.update, (index, row) => {
      const table = this.$refs.table.$refs.table;
      table.updateRow({ index, row });
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
    return {
      searchText: null,
      rowEvents: {
        update: 'admin:serviceaccounts:rowUpdate',
        delete: 'admin:serviceaccounts:rowDeleted',
      },
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
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
          title: this.$t('admin.suspended'),
          field: 'suspended',
          align: 'center',
          class: 'tight',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
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
          return this.vueFormatter({
            render: () => (
              <ServiceAccountDetails
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
      const baseUrl = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE_ACCOUNT}`;
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
