<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('message.component_properties')"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-check="onRowSelectionChange"
      @on-uncheck="onRowSelectionChange"
    >
    </bootstrap-table>
    <template v-slot:footer="{ cancel }">
      <b-button
        variant="outline-danger"
        @click="deleteProperty"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_DELETE,
        ]"
        :disabled="!hasRowsSelected"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        variant="primary"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
        ]"
        @click="$emit('createProperty')"
        >{{ $t('message.create_property') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import common from '../../../shared/common';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'ComponentPropertiesModal',
  mixins: [permissionsMixin, modalMixin],
  props: {
    uuid: String,
  },
  emits: ['createProperty'],
  data() {
    return {
      columns: [
        {
          field: 'state',
          checkbox: true,
        },
        {
          title: this.$t('message.group'),
          field: 'groupName',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.name'),
          field: 'propertyName',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.value'),
          field: 'propertyValue',
          sortable: false,
          editable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.type'),
          field: 'propertyType',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.description'),
          field: 'description',
          sortable: false,
          visible: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
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
        pageList: '[10, 25]',
        pageSize: 10,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
      },
      hasRowsSelected: false,
    };
  },
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${this.uuid}/property`;
    },
    onRowSelectionChange: function () {
      this.hasRowsSelected = this.$refs.table.getSelections().length > 0;
    },
    deleteProperty: async function () {
      let selections = this.$refs.table.getSelections();
      if (!(await this.$confirmDelete())) return;
      for (let i = 0; i < selections.length; i++) {
        this.axios.delete(`${this.apiUrl()}/${selections[i].uuid}`).then(() => {
          this.$refs.table?.refresh({ silent: true });
          this.$toastr.s(this.$t('message.property_deleted'));
        });
      }
      // The confirmation closes this modal, which unmounts the table.
      this.$refs.table?.uncheckAll();
      this.hasRowsSelected = false;
    },
  },
};
</script>
