<template>
  <b-modal
    id="projectPropertiesModal"
    size="lg"
    hide-header-close
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
    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="outline-danger" @click="deleteProperty">{{
        $t('message.delete')
      }}</b-button>
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        v-b-modal.projectCreatePropertyModal
        >{{ $t('message.create_property') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import common from '@/shared/common';
import xssFilters from 'xss-filters';
import { BButton, BModal } from 'bootstrap-vue';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';

export default {
  components: {
    BModal,
    BButton,
    BootstrapTable,
  },
  props: {
    uuid: String,
  },
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
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.name'),
          field: 'propertyName',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.value'),
          field: 'propertyValue',
          sortable: false,
          editable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.type'),
          field: 'propertyType',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.description'),
          field: 'description',
          sortable: false,
          visible: false,
          formatter(value, row, index) {
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
    deleteProperty: function () {
      let selections = this.$refs.table.getSelections();
      for (let i = 0; i < selections.length; i++) {
        this.axios
          .delete(this.apiUrl(), {
            data: {
              groupName: selections[i].groupName,
              propertyName: selections[i].propertyName,
            },
          })
          .then((response) => {
            this.$refs.table.refresh({ silent: true });
            this.$toastr.s(this.$t('message.property_deleted'));
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
      this.$refs.table.uncheckAll();
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/vendors/vue-tags-input/vue-tags-input';
</style>
