<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('message.project_properties')"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:footer="{ cancel }">
      <b-button
        v-permission:or="[
          'PORTFOLIO_MANAGEMENT',
          'PORTFOLIO_MANAGEMENT_DELETE',
        ]"
        variant="outline-danger"
        @click="deleteProperty"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        v-permission:or="[
          'PORTFOLIO_MANAGEMENT',
          'PORTFOLIO_MANAGEMENT_CREATE',
        ]"
        variant="primary"
        @click="$emit('createProperty')"
        >{{ $t('message.create_property') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import common from '../../../shared/common';
import xssFilters from 'xss-filters';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'ProjectPropertiesModal',
  mixins: [modalMixin],
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
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
      },
    };
  },
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${this.uuid}/property`;
    },
    deleteProperty: async function () {
      let selections = this.$refs.table.getSelections();
      if (!(await this.$confirmDelete())) return;
      for (let i = 0; i < selections.length; i++) {
        this.axios
          .delete(this.apiUrl(), {
            data: {
              groupName: selections[i].groupName,
              propertyName: selections[i].propertyName,
            },
          })
          .then(() => {
            this.$refs.table?.refresh({ silent: true });
            this.$toastr.s(this.$t('message.property_deleted'));
          })
          .catch(() => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
      // The confirmation closes this modal, which unmounts the table.
      this.$refs.table?.uncheckAll();
    },
  },
};
</script>
