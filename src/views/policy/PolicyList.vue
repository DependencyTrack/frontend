<template>
  <div class="animated fadeIn">
    <div id="policiesToolbar" class="bs-table-custom-toolbar">
      <b-button
        variant="primary"
        @click="showCreatePolicyModal = true"
        v-permission:or="[
          PERMISSIONS.POLICY_MANAGEMENT,
          PERMISSIONS.POLICY_MANAGEMENT_CREATE,
        ]"
      >
        <span class="fa fa-plus"></span> {{ $t('message.create_policy') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
    />
    <create-policy-modal
      v-model="showCreatePolicyModal"
      v-on:refreshTable="refreshTable"
    />
  </div>
</template>

<script>
import common from '../../shared/common';
import xssFilters from 'xss-filters';
import CreatePolicyModal from './CreatePolicyModal.vue';
import permissionsMixin from '../../mixins/permissionsMixin';
import routerMixin from '../../mixins/routerMixin';
import EventBus from '../../shared/eventbus';
import bootstrapTableMixin from '../../mixins/bootstrapTableMixin';
import PolicyDetails from './PolicyDetails.vue';

export default {
  mixins: [permissionsMixin, bootstrapTableMixin, routerMixin],
  components: {
    CreatePolicyModal,
  },
  emits: ['total'],
  mounted() {
    EventBus.on('policyManagement:policies:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.on('policyManagement:policies:rowDeleted', () => {
      this.refreshTable();
    });
  },
  beforeUnmount() {
    EventBus.off('policyManagement:policies:rowUpdate');
    EventBus.off('policyManagement:policies:rowDeleted');
  },
  methods: {
    tableLoaded: function (data) {
      if (data && Object.prototype.hasOwnProperty.call(data, 'total')) {
        this.$emit('total', data.total);
      } else {
        this.$emit('total', '?');
      }
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        silent: true,
      });
    },
  },
  data() {
    return {
      showCreatePolicyModal: false,
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value, row) {
            return (
              common.formatNotificationLabel(row.violationState) +
              ` ${xssFilters.inHTMLData(value)}`
            );
            //return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
          },
        },
      ],
      data: [],
      options: {
        showHeader: false,
        search: true,
        showColumns: false,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage && localStorage.getItem('PolicyListPageSize') !== null
            ? Number(localStorage.getItem('PolicyListPageSize'))
            : 10,
        searchText: this.$route.query.searchText
          ? this.$route.query.searchText
          : '',
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.cell(PolicyDetails, { row, index });
        },
        onExpandRow: this.mountCells,
        toolbar: '#policiesToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`,
        onPageChange: (_number, size) => {
          if (localStorage) {
            localStorage.setItem('PolicyListPageSize', size.toString());
          }
        },
        onSearch: (text) => {
          this.setSearchTextQuery(text);
        },
      },
    };
  },
};
</script>
