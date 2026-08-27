<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createTeamModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_team') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options"
      >
      </bootstrap-table>
    </b-card-body>
    <create-team-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../../shared/common';
import CreateTeamModal from '../CreateTeamModal';
import bootstrapTableMixin from '../../../../mixins/bootstrapTableMixin';
import EventBus from '../../../../shared/eventbus';
import TeamDetails from './TeamDetails.vue';

export default {
  name: 'TeamsView',
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    CreateTeamModal,
  },
  mounted() {
    EventBus.$on(this.rowEvents.update, (index, row) => {
      this.$refs.table.updateRow({ index, row });
      this.$refs.table.expandRow(index);
    });
    EventBus.$on(this.rowEvents.delete, () => {
      this.refreshTable();
    });
  },
  beforeDestroy() {
    EventBus.$off(this.rowEvents.update);
    EventBus.$off(this.rowEvents.delete);
  },
  data() {
    return {
      rowEvents: {
        update: 'admin:teams:rowUpdate',
        delete: 'admin:teams:rowDeleted',
      },
      columns: [
        {
          title: this.$t('admin.team_name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.api_keys'),
          field: 'apiKeys',
          sortable: false,
          formatter(value) {
            return value
              ? xssFilters.inHTMLData(
                  common.valueWithDefault(value.length, '0'),
                )
              : 0;
          },
        },
        {
          title: this.$t('admin.members'),
          field: 'members',
          sortable: false,
          formatter(_value, row) {
            let count = 0;
            if (row.managedUsers) {
              count += row.managedUsers.length;
            }
            if (row.ldapUsers) {
              count += row.ldapUsers.length;
            }
            if (row.oidcUsers) {
              count += row.oidcUsers.length;
            }
            return count;
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
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.vueFormatter({
            render: () => (
              <TeamDetails row={row} index={index} rowEvents={this.rowEvents} />
            ),
          });
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`,
      },
    };
  },
  methods: {
    refreshTable: function () {
      this.$refs.table.refresh({
        silent: true,
      });
    },
  },
};
</script>
