<template>
  <div class="animated fadeIn">
    <div id="licenseGroupsToolbar" class="bs-table-custom-toolbar">
      <b-button
        variant="outline-primary"
        @click="showCreateLicenseGroupModal = true"
        v-permission:or="[
          PERMISSIONS.POLICY_MANAGEMENT,
          PERMISSIONS.POLICY_MANAGEMENT_CREATE,
        ]"
      >
        <span class="fa fa-plus"></span>
        {{ $t('message.create_license_group') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
    />
    <create-license-group-modal
      v-model="showCreateLicenseGroupModal"
      v-on:refreshTable="refreshTable"
    />
  </div>
</template>

<script>
import common from '../../shared/common';
import xssFilters from 'xss-filters';
import CreateLicenseGroupModal from './CreateLicenseGroupModal.vue';
import permissionsMixin from '../../mixins/permissionsMixin';
import EventBus from '../../shared/eventbus';
import bootstrapTableMixin from '../../mixins/bootstrapTableMixin';
import LicenseGroupDetails from './LicenseGroupDetails.vue';

export default {
  mixins: [permissionsMixin, bootstrapTableMixin],
  components: {
    CreateLicenseGroupModal,
  },
  emits: ['total'],
  mounted() {
    EventBus.on('policyManagement:licenseGroups:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.on('policyManagement:licenseGroups:rowDeleted', () => {
      this.refreshTable();
    });
  },
  beforeUnmount() {
    EventBus.off('policyManagement:licenseGroups:rowUpdate');
    EventBus.off('policyManagement:licenseGroups:rowDeleted');
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
      showCreateLicenseGroupModal: false,
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
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
          localStorage &&
          localStorage.getItem('LicenseGroupListPageSize') !== null
            ? Number(localStorage.getItem('LicenseGroupListPageSize'))
            : 10,
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.cell(LicenseGroupDetails, { row, index });
        },
        onExpandRow: this.mountCells,
        toolbar: '#licenseGroupsToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}`,
        onPageChange: (_number, size) => {
          if (localStorage) {
            localStorage.setItem('LicenseGroupListPageSize', size.toString());
          }
        },
      },
    };
  },
};
</script>
