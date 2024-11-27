<template>
  <b-modal
    id="componentPropertiesModal"
    size="lg"
    hide-header-close
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
    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="outline-danger"
        @click="deleteProperty"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        :disabled="!hasRowsSelected"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        v-b-modal.componentCreatePropertyModal
        >{{ $t('message.create_property') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import common from '../../../shared/common';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';

export default {
  name: 'ComponentPropertiesModal',
  mixins: [permissionsMixin],
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
    deleteProperty: function () {
      let selections = this.$refs.table.getSelections();
      for (let i = 0; i < selections.length; i++) {
        this.axios.delete(`${this.apiUrl()}/${selections[i].uuid}`).then(() => {
          this.$refs.table.refresh({ silent: true });
          this.$toastr.s(this.$t('message.property_deleted'));
        });
      }
      this.$refs.table.uncheckAll();
      this.hasRowsSelected = false;
    },
  },
};
</script>

<style lang="scss">
@import '../../../assets/scss/vendors/vue-tags-input/vue-tags-input';
</style>
