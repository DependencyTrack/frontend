<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button variant="primary" @click="showCreateAlertModal = true">
          <span class="fa fa-plus"></span> {{ $t('admin.create_alert') }}
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
    <create-alert-modal
      v-model="showCreateAlertModal"
      v-on:refreshTable="refreshTable"
    />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../shared/common';
import CreateAlertModal from './CreateAlertModal.vue';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import EventBus from '../../../shared/eventbus';
import AlertDetails from './AlertDetails.vue';

export default {
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    CreateAlertModal,
  },
  mounted() {
    EventBus.on('admin:alerts:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.on('admin:alerts:rowDeleted', () => {
      this.refreshTable();
    });
  },
  beforeUnmount() {
    EventBus.off('admin:alerts:rowUpdate');
    EventBus.off('admin:alerts:rowDeleted');
  },
  data() {
    return {
      showCreateAlertModal: false,
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.publisher'),
          field: 'publisher.name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.scope'),
          field: 'scope',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.notification_level'),
          field: 'notificationLevel',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.alert_trigger_type'),
          field: 'triggerType',
          sortable: false,
          formatter: (value) => {
            return value === 'SCHEDULE'
              ? this.$t('admin.alert_trigger_type_schedule')
              : this.$t('admin.alert_trigger_type_event');
          },
        },
        {
          title: this.$t('admin.enabled'),
          field: 'enabled',
          sortable: false,
          align: 'center',
          formatter: function (value) {
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
        sidePagination: 'server',
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
          return this.cell(AlertDetails, { row, index });
        },
        onExpandRow: this.mountCells,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}`,
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
