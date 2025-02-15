<template>
  <b-modal
    id="selectLicenseModal"
    size="lg"
    hide-header-close
    no-stacking
    :title="$t('message.select_license')"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        @click="$emit('selection', $refs.table.getSelections())"
        >{{ $t('message.select') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '@/mixins/permissionsMixin';
import common from '@/shared/common';
import { BButton, BModal } from 'bootstrap-vue';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';

export default {
  components: {
    BModal,
    BButton,
    BootstrapTable,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.spdx_license_id'),
          field: 'licenseId',
          sortable: true,
          formatter: function (value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../licenses/' + encodeURIComponent(value),
            );
            return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
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
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}`,
      },
    };
  },
};
</script>
