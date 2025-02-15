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
    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()"
        >{{ $t('message.cancel') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import permissionsMixin from '@/mixins/permissionsMixin';
import common from '@/shared/common';
import router from '@/router';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import { BButton, BModal } from 'bootstrap-vue';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';

export default {
  components: {
    BModal,
    BButton,
    BootstrapTable,
  },
  mixins: [bootstrapTableMixin, permissionsMixin],
  props: {
    tag: String,
    index: Number,
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
            icon: 'fa fa-minus',
            attributes: {
              title: this.$t('message.unassign_tag_from_selection'),
            },
            event: () => {
              let selected = this.$refs.table.getSelections();
              if (
                !selected ||
                (Array.isArray(selected) && selected.length === 0)
              ) {
                this.$toastr.w(this.$t('message.empty_selection'));
                return;
              }

              this.untag(selected.map((row) => row.uuid)).then(() => {
                this.$toastr.s(this.$t('message.tag_unassigned_successfully'));
                this.refreshTable();
              });
            },
          },
        },
        buttonsOrder: ['btnDeleteSelected', 'refresh', 'columns'],
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
  mounted() {
    // NB: Because this modal is loaded dynamically from TagList,
    // this.$refs.table may still be undefined when mounted() is called.
    // https://jefrydco.id/en/blog/safe-access-vue-refs-undefined
    const interval = setInterval(() => {
      if (this.$refs.table) {
        this.$refs.table.refreshOptions({
          showBtnDeleteSelected: this.isPermitted(
            this.PERMISSIONS.PORTFOLIO_MANAGEMENT,
          ),
        });
        clearInterval(interval);
      }
    }, 50);
  },
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_TAG}/${encodeURIComponent(this.tag)}/project`;
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
};
</script>
