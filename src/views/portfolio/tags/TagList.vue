<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <portfolio-widget-row :fetch="true" />
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="this.vueFormatterInit"
    >
    </bootstrap-table>
  </div>
</template>

<script>
import common from '../../../shared/common';
import PortfolioWidgetRow from '../../dashboard/PortfolioWidgetRow';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import routerMixin from '../../../mixins/routerMixin';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import TaggedPoliciesListModal from '@/views/portfolio/tags/TaggedPoliciesListModal.vue';
import TaggedProjectListModal from '@/views/portfolio/tags/TaggedProjectListModal.vue';
import i18n from '@/i18n';
export default {
  mixins: [bootstrapTableMixin, permissionsMixin, routerMixin],
  components: {
    PortfolioWidgetRow,
  },
  methods: {
    deleteTags: function (tagNames) {
      return this.axios.delete(`${this.$api.BASE_URL}/${this.$api.URL_TAG}`, {
        data: tagNames,
      });
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: `${this.$api.BASE_URL}/${this.$api.URL_TAG}`,
        silent: true,
      });
    },
  },
  data() {
    return {
      errorsByTagName: {},
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
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.projects'),
          field: 'projectCount',
          sortable: true,
          formatter: (value, row, index) => {
            if (value === 0) {
              return value;
            }

            return this.vueFormatter({
              i18n,
              components: {
                TaggedProjectListModal,
              },
              mixins: [permissionsMixin],
              template: `
                <div>
                  <b-link v-b-modal="\`taggedProjectListModal-${index}\`">{{ value }}</b-link>
                  <span v-if="error" class="fa fa-apple"></span>
                  <tagged-project-list-modal :tag="tagName" :index="index"/>
                </div>`,
              data() {
                return {
                  index: index,
                  tagName: row.name,
                  error: row.error,
                  value: value,
                };
              },
            });
          },
        },
        {
          title: this.$t('message.policies'),
          field: 'policyCount',
          sortable: true,
          formatter: (value, row, index) => {
            if (value === 0) {
              return value;
            }

            return this.vueFormatter({
              i18n,
              components: {
                TaggedPoliciesListModal,
              },
              mixins: [permissionsMixin],
              template: `
                <div>
                  <b-link v-b-modal="\`taggedPoliciesListModal-${index}\`">{{ value }}</b-link>
                  <tagged-policies-list-modal :tag="tagName" :index="index"/>
                </div>`,
              data() {
                return {
                  index: index,
                  tagName: row.name,
                  value: value,
                };
              },
            });
          },
        },
      ],
      data: [],
      options: {
        buttons: {
          btnDeleteSelected: {
            text: 'Delete',
            icon: 'fa fa-trash',
            event: () => {
              let selected = this.$refs.table.getSelections();
              if (!selected) {
                return;
              }

              this.deleteTags(selected.map((row) => row.name))
                .then(() => {
                  this.$toastr.s(this.$t('message.updated'));
                  this.refreshTable();
                })
                .catch((error) => {
                  if (
                    error.response.status >= 400 &&
                    error.response.status < 500 &&
                    error.response.headers['content-type'] ===
                      'application/problem+json' &&
                    error.response.data.errors
                  ) {
                    // TODO: Use this to highlight rows that caused deletion to fail.
                    this.errorsByTagName = error.response.data.errors;
                  }
                });
            },
          },
        },
        clickToSelect: true,
        uniqueId: 'name',
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
        sortName: undefined,
        sortOrder: undefined,
        searchText: '',
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_TAG}`,
      },
    };
  },
};
</script>
