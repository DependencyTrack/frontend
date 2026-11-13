<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button variant="primary" @click="showCreateSamlGroupModal = true">
          <span class="fa fa-plus"></span>
          {{ $t('admin.create_saml_group') }}
        </b-button>
      </div>
      <token-paginated-table
        ref="table"
        :base-url="tableDataBaseUrl"
        :columns="columns"
        :options="options"
      />
    </b-card-body>
    <create-saml-group-modal
      v-model="showCreateSamlGroupModal"
      v-on:refreshTable="refreshTable"
    />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../shared/common';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import EventBus from '../../../shared/eventbus';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import CreateSamlGroupModal from './CreateSamlGroupModal.vue';
import SamlGroupDetails from './SamlGroupDetails.vue';

export default {
  name: 'SamlGroupsView',
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    TokenPaginatedTable,
    CreateSamlGroupModal,
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
      showCreateSamlGroupModal: false,
      tableDataBaseUrl: `${this.$api.BASE_URL}/${this.$api.URL_SAML_GROUP}`,
      rowEvents: {
        update: 'admin:samlgroups:rowUpdate',
        delete: 'admin:samlgroups:rowDeleted',
      },
      columns: [
        {
          title: this.$t('admin.saml_group_name'),
          field: 'name',
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.mapped_teams'),
          field: 'teams',
          formatter(value) {
            return value ? value.length : 0;
          },
        },
      ],
      options: {
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.cell(SamlGroupDetails, {
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
  methods: {
    refreshTable: function () {
      this.$refs.table.refreshCurrentPage();
    },
  },
};
</script>
