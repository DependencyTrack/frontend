<template>
  <b-modal
    :id="`taggedCollectionProjectListModal-${index}`"
    size="lg"
    hide-header-close
    no-stacking
    v-permission="'VIEW_PORTFOLIO'"
    :title="$t('message.collection_projects_using_tag', { tag: this.tag })"
  >
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()"
        >{{ $t('message.cancel') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import router from '@/router';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';

export default {
  props: {
    tag: String,
    index: Number,
  },
  mixins: [bootstrapTableMixin, permissionsMixin],
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_TAG}/${encodeURIComponent(this.tag)}/collectionProject`;
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
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter: (value, row) => {
            // TODO: Close modal when link is clicked.
            const href = router.resolve({
              name: 'Project',
              params: { uuid: row.uuid },
            }).route.fullPath;
            return `<a href="${href}">${xssFilters.inHTMLData(value)}</a>`;
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      data: [],
      options: {
        buttonsOrder: ['refresh', 'columns'],
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
        toolbar: '#tagsToolbar',
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
