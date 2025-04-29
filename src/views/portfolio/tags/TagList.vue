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
import TaggedCollectionProjectListModal from '@/views/portfolio/tags/TaggedCollectionProjectListModal.vue';
import TaggedNotificationRuleListModal from '@/views/portfolio/tags/TaggedNotificationRuleListModal.vue';
import TaggedPoliciesListModal from '@/views/portfolio/tags/TaggedPoliciesListModal.vue';
import TaggedProjectListModal from '@/views/portfolio/tags/TaggedProjectListModal.vue';
import i18n from '@/i18n';
import MurmurHash2 from 'imurmurhash';

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
  mounted() {
    this.$refs.table.refreshOptions({
      showBtnDeleteSelected: this.isPermitted(this.PERMISSIONS.TAG_MANAGEMENT),
    });
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
          title: this.$t('message.collection_projects'),
          field: 'collectionProjectCount',
          sortable: true,
          formatter: (value, row, index) => {
            if (value === 0) {
              return value;
            }

            return this.vueFormatter({
              i18n,
              components: {
                TaggedCollectionProjectListModal,
              },
              mixins: [permissionsMixin],
              template: `
                <div>
                  <b-link v-b-modal="\`taggedCollectionProjectListModal-${index}\`">{{ value }}</b-link>
                  <tagged-collection-project-list-modal :tag="tagName" :index="index"/>
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
        {
          title: this.$t('admin.alerts'),
          field: 'notificationRuleCount',
          sortable: true,
          formatter: (value, row, index) => {
            if (value === 0) {
              return value;
            }

            return this.vueFormatter({
              i18n,
              components: {
                TaggedNotificationRuleListModal,
              },
              mixins: [permissionsMixin],
              template: `
                <div>
                  <b-link v-b-modal="\`taggedNotificationRuleListModal-${index}\`">{{ value }}</b-link>
                  <tagged-notification-rule-list-modal :tag="tagName" :index="index"/>
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
            icon: 'fa fa-trash',
            attributes: {
              title: this.$t('message.delete_selected'),
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

              this.deleteTags(selected.map((row) => row.name))
                .then(() => {
                  this.$toastr.s(this.$t('message.selection_deleted'));
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
        buttonsOrder: ['btnDeleteSelected', 'refresh', 'columns'],
        clickToSelect: true,
        uniqueId: 'nameHash',
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
          for (let tag of res) {
            // Tag names with special characters can break table rendering.
            // https://github.com/DependencyTrack/dependency-track/issues/4357
            tag.nameHash = MurmurHash2(tag.name).result();
          }
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_TAG}`,
      },
    };
  },
};
</script>
