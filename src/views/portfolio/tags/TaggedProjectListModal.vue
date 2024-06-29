<template>
  <b-modal
    :id="`taggedProjectListModal-${index}`"
    size="lg"
    hide-header-close
    no-stacking
    v-permission="'VIEW_PORTFOLIO'"
    :title="$t('message.projects_tagged_with', { tag: this.tag })"
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
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import router from '@/router';

export default {
  props: {
    tag: String,
    index: Number,
  },
  mixins: [permissionsMixin],
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_TAG}/${this.tag}/project`;
    },
    untag: function (projectUuids) {
      return this.axios.delete(this.apiUrl(), {
        data: projectUuids,
      });
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
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter: (value, row) => {
            // TODO: Close modal when link is clicked.
            const href = router.resolve({
              name: 'Project',
              params: { uuid: row.uuid },
            }).href;
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
        buttons: {
          btnDeleteSelected: {
            text: 'Untag',
            icon: 'fa fa-trash',
            event: () => {
              let selected = this.$refs.table.getSelections();
              if (!selected) {
                return;
              }

              this.untag(selected.map((row) => row.uuid))
                .then(() => {
                  this.$toastr.s(this.$t('message.updated'));
                  this.refreshTable();
                })
                .catch((error) => {
                  this.$toastr.e(this.$t('message.updated'));
                });
            },
          },
        },
        clickToSelect: true,
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
