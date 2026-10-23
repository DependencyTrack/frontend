<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="repositoryToolbar" class="bs-table-custom-toolbar">
        <b-button
          variant="outline-primary"
          @click="showRepositoryCreateRepositoryModal = true"
        >
          <span class="fa fa-plus"></span> {{ $t('admin.create_repository') }}
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
    <repository-create-repository-modal
      v-model="showRepositoryCreateRepositoryModal"
      :type="type"
      v-on:refreshTable="refreshTable"
    />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import RepositoryCreateRepositoryModal from './RepositoryCreateRepositoryModal.vue';
import RepositoryDetails from './RepositoryDetails.vue';

export default {
  props: {
    header: String,
    type: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    RepositoryCreateRepositoryModal,
  },
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.type}?orderBy=resolutionOrder&sort=asc`;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        pageNumber: 1,
        silent: true,
      });
    },
  },
  mounted() {
    EventBus.on('admin:repository:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.on('admin:repository:rowDeleted', () => {
      this.refreshTable();
    });
  },
  beforeUnmount() {
    EventBus.off('admin:repository:rowUpdate');
    EventBus.off('admin:repository:rowDeleted');
  },
  data() {
    return {
      showRepositoryCreateRepositoryModal: false,
      columns: [
        {
          title: this.$t('admin.identifier'),
          field: 'identifier',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.url'),
          field: 'url',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.internal'),
          field: 'internal',
          class: 'tight',
          sortable: true,
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.repository_authentication'),
          field: 'authenticationRequired',
          class: 'tight',
          sortable: true,
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.enabled'),
          field: 'enabled',
          class: 'tight',
          sortable: true,
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
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
          return this.cell(RepositoryDetails, { row, index });
        },
        onExpandRow: this.mountCells,
        toolbar: '#repositoryToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
      },
    };
  },
};
</script>
