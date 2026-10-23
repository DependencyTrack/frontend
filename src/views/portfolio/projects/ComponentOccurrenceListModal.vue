<template>
  <b-modal
    v-model="visible"
    size="lg"
    no-stacking
    :title="$t('message.occurrences_of_component', { name: componentName })"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('message.cancel') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import common from '@/shared/common';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [modalMixin],
  props: {
    componentUuid: String,
    componentName: String,
  },
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${encodeURIComponent(this.componentUuid)}/occurrence`;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        pageNumber: 1,
        silent: true,
      });
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('message.occurrence_location'),
          field: 'location',
          sortable: false,
        },
        {
          title: this.$t('message.occurrence_line'),
          field: 'line',
          sortable: false,
          visible: false,
        },
        {
          title: this.$t('message.occurrence_offset'),
          field: 'offset',
          sortable: false,
          visible: false,
        },
        {
          title: this.$t('message.occurrence_symbol'),
          field: 'symbol',
          sortable: false,
          visible: false,
        },
        {
          title: this.$t('message.created'),
          field: 'createdAt',
          sortable: false,
          visible: false,
          formatter: (value) => {
            return common.formatTimestamp(value, true);
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
    };
  },
};
</script>
