<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-b-modal.createTemplateModal
        >
          <span class="fa fa-plus"></span> {{ $t('admin.create_template') }}
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
    <create-template-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import CreateTemplateModal from './CreateTemplateModal.vue';
import TemplateDetails from './TemplateDetails.vue';

export default {
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    CreateTemplateModal,
  },
  mounted() {
    EventBus.on('admin:templates:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.on('admin:templates:rowDeleted', () => {
      this.refreshTable();
    });
    EventBus.on('admin:templates:cloneTemplate', () => {
      this.$bvModal.show('createTemplateModal');
    });
  },
  beforeUnmount() {
    EventBus.off('admin:templates:rowUpdate');
    EventBus.off('admin:templates:rowDeleted');
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.default'),
          field: 'defaultPublisher',
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
          return this.cell(TemplateDetails, { row, index });
        },
        onExpandRow: this.mountCells,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`,
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

<style>
#customToolbar > :not(:last-child) {
  margin-right: 0.25rem;
}

#customToolbar > :not(:first-child) {
  margin-left: 0.25rem;
}
</style>
