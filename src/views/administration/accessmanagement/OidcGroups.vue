<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-b-modal.createOidcGroupModal
        >
          <span class="fa fa-plus"></span>
          {{ $t('admin.create_oidc_group') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options"
      ></bootstrap-table>
    </b-card-body>
    <create-oidc-group-modal @refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '@/shared/common';
import i18n from '@/i18n';
import CreateOidcGroupModal from './CreateOidcGroupModal';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import EventBus from '@/shared/eventbus';
import ActionableListGroupItem from '@/views/components/ActionableListGroupItem';
import permissionsMixin from '@/mixins/permissionsMixin';
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import SelectTeamModal from './SelectTeamModal';
import { BButton, BCard, BCardBody } from 'bootstrap-vue';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';

export default {
  components: {
    CreateOidcGroupModal,
    BCard,
    BCardBody,
    BButton,
    BootstrapTable,
  },
  mixins: [bootstrapTableMixin],
  props: {
    header: String,
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('admin.oidc_group_name'),
          field: 'name',
          sortable: false,
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
        sidePagination: 'client',
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
            i18n,
            template: `
              <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-input-group-form-input id="input-oidcgroup-name" :label="$t('admin.oidc_group_name')" input-group-size="mb-3"
                                              required="true" type="text" v-model="oidcGroup.name" lazy="true" autofocus="true"
                                              v-debounce:750ms="updateOidcGroup" :debounce-events="'keyup'" />
                    <b-form-group :label="this.$t('admin.mapped_teams')">
                      <div class="list-group">
                        <span v-for="mappedTeam in mappedTeams">
                          <actionable-list-group-item :value="mappedTeam.name" :delete-icon="true" v-on:actionClicked="removeOidcGroupMapping(mappedTeam)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectTeamModal')"/>
                      </div>
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                    <div style="text-align:right">
                       <b-button variant="outline-danger" @click="deleteOidcGroup">{{ $t('admin.delete_oidc_group') }}</b-button>
                    </div>
                  </b-col>
                  <select-team-modal v-on:selection="updateTeamSelection" />
                </b-row>
              `,
            mixins: [permissionsMixin],
            components: {
              ActionableListGroupItem,
              BInputGroupFormInput,
              SelectTeamModal,
            },
            data() {
              return {
                oidcGroup: row,
                mappedTeams: [],
              };
            },
            methods: {
              updateOidcGroup: function () {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}`;
                this.axios
                  .post(url, {
                    uuid: this.oidcGroup.uuid,
                    name: this.oidcGroup.name,
                  })
                  .then((response) => {
                    this.team = response.data;
                    EventBus.$emit(
                      'admin:oidcgroups:rowUpdate',
                      index,
                      this.team,
                    );
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              deleteOidcGroup: function () {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}/${this.oidcGroup.uuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    EventBus.$emit('admin:oidcgroups:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.oidc_group_deleted'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              getMappedTeams: function () {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}/${this.oidcGroup.uuid}/team`;
                this.axios
                  .get(url)
                  .then((response) => {
                    this.mappedTeams = response.data;
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updateTeamSelection: function (selections) {
                this.$root.$emit('bv::hide::modal', 'selectTeamModal');
                for (let i = 0; i < selections.length; i++) {
                  const selection = selections[i];
                  const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}`;
                  this.axios
                    .put(url, {
                      group: this.oidcGroup.uuid,
                      team: selection.uuid,
                    })
                    .then((response) => {
                      this.mappedTeams.push(selection);
                      this.mappedTeams.sort();
                      this.$toastr.s(this.$t('message.updated'));
                    })
                    .catch((error) => {
                      this.$toastr.w(this.$t('condition.unsuccessful_action'));
                    });
                }
              },
              removeOidcGroupMapping: function (team) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}/${this.oidcGroup.uuid}/team/${team.uuid}/mapping`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    const remainingTeams = [];
                    for (let i = 0; i < this.mappedTeams.length; i++) {
                      if (this.mappedTeams[i].uuid !== team.uuid) {
                        remainingTeams.push(this.mappedTeams[i]);
                      }
                    }
                    this.mappedTeams = remainingTeams;
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
            },
            mounted: function () {
              this.getMappedTeams();
            },
          });
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}`,
      },
    };
  },
  mounted() {
    EventBus.$on('admin:oidcgroups:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.$on('admin:oidcgroups:rowDeleted', (index, row) => {
      this.refreshTable();
    });
  },
  beforeDestroy() {
    EventBus.$off('admin:oidcgroups:rowUpdate');
    EventBus.$off('admin:oidcgroups:rowDeleted');
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
