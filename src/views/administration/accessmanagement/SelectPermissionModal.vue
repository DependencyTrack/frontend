<template>
  <b-modal
    id="selectPermissionModal"
    size="lg"
    hide-header-close
    no-stacking
    :title="$t('admin.select_permission')"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:modal-footer="{ cancel }">
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
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';

export default {
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
      ],
      data: [],
      options: {
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        maintainMetaData: true,
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
        url: `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}`,
      },
    };
  },
};
</script>
