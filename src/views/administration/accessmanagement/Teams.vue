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
    <create-team-modal @refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '@/shared/common';
import i18n from '@/i18n';
import CreateTeamModal from './CreateTeamModal';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import EventBus from '@/shared/eventbus';
import ActionableListGroupItem from '@/views/components/ActionableListGroupItem';
import ApiKeyListGroupItem from './ApiKeyListGroupItem.vue';
import SelectLdapGroupModal from './SelectLdapGroupModal';
import SelectOidcGroupModal from './SelectOidcGroupModal';
import SelectPermissionModal from './SelectPermissionModal';
import permissionsMixin from '@/mixins/permissionsMixin';
import { Switch as cSwitch } from '@coreui/vue';
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import { BButton, BCard, BCardBody } from 'bootstrap-vue';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';

export default {
  components: {
    CreateTeamModal,
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
          title: this.$t('admin.team_name'),
          field: 'name',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.api_keys'),
          field: 'apiKeys',
          sortable: false,
          formatter(value, row, index) {
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
          formatter(value, row, index) {
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
                    <b-input-group-form-input id="input-team-name" :label="$t('admin.team_name')" input-group-size="mb-3"
                                              required="true" type="text" v-model="name" lazy="true" autofocus="true"
                                              v-debounce:750ms="updateTeam" :debounce-events="'keyup'" />
                    <b-form-group :label="this.$t('admin.api_keys')">
                      <div class="list-group">
                        <span v-for="key in sortedApiKeys">
                          <api-key-list-group-item :team-uuid="team.uuid" :api-key="apiKeys[key]" :delete-icon="true" v-on:removeClicked="removeApiKey(apiKeys[key])" v-on:regenerateClicked="regenerateApiKey(apiKeys[key])"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="createApiKey()" :tooltip="$t('admin.new_api_key_title')"/>
                      </div>
                    </b-form-group>
                    <b-form-group :label="this.$t('admin.permissions')">
                      <div class="list-group">
                        <span v-for="permission in permissions">
                          <actionable-list-group-item :value="permission.name" :delete-icon="true" v-on:actionClicked="removePermission(permission)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectPermissionModal')"/>
                      </div>
                    </b-form-group>
                    <b-form-group :label="this.$t('admin.mapped_ldap_groups')">
                      <div class="list-group">
                        <span v-for="ldapGroup in ldapGroups">
                          <actionable-list-group-item :value="ldapGroup.dn" :delete-icon="true" v-on:actionClicked="removeLdapGroupMapping(ldapGroup.uuid)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectLdapGroupModal')"/>
                      </div>
                    </b-form-group>
                    <b-form-group :label="this.$t('admin.mapped_oidc_groups')">
                      <div class="list-group">
                        <span v-for="mappedOidcGroup in mappedOidcGroups">
                          <actionable-list-group-item :value="mappedOidcGroup.group.name" :delete-icon="true" v-on:actionClicked="removeOidcGroupMapping(mappedOidcGroup.uuid)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectOidcGroupModal')"/>
                      </div>
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                    <b-form-group v-if="managedUsers && managedUsers.length > 0" :label="this.$t('admin.managed_users')">
                      <div class="list-group">
                        <span v-for="managedUser in managedUsers">
                          <actionable-list-group-item :value="managedUser.username" :delete-icon="true" v-on:actionClicked="removeUser(managedUser)"/>
                        </span>
                      </div>
                    </b-form-group>
                    <b-form-group v-if="ldapUsers && ldapUsers.length > 0"  :label="this.$t('admin.ldap_users')">
                      <div class="list-group">
                        <span v-for="ldapUser in ldapUsers">
                          <actionable-list-group-item :value="ldapUser.username" :delete-icon="true" v-on:actionClicked="removeUser(ldapUser)"/>
                        </span>
                      </div>
                    </b-form-group>
                    <b-form-group v-if="oidcUsers && oidcUsers.length > 0"  :label="this.$t('admin.oidc_users')">
                      <div class="list-group">
                        <span v-for="oidcUser in oidcUsers">
                          <actionable-list-group-item :value="oidcUser.username" :delete-icon="true" v-on:actionClicked="removeUser(oidcUser)"/>
                        </span>
                      </div>
                    </b-form-group>
                    <div style="text-align:right">
                       <b-button variant="outline-danger" @click="deleteTeam">{{ $t('admin.delete_team') }}</b-button>
                    </div>
                  </b-col>
                  <select-permission-modal v-on:selection="updatePermissionSelection" />
                  <select-ldap-group-modal v-on:selection="updateLdapGroupSelection" />
                  <select-oidc-group-modal v-on:selection="updateOidcGroupSelection" />
                </b-row>
              `,
            mixins: [permissionsMixin],
            components: {
              cSwitch,
              ActionableListGroupItem,
              ApiKeyListGroupItem,
              SelectLdapGroupModal,
              SelectOidcGroupModal,
              SelectPermissionModal,
              BInputGroupFormInput,
            },
            data() {
              return {
                team: row,
                name: row.name,
                apiKeys: this.apiKeysToDict(row.apiKeys),
                permissions: row.permissions,
                ldapGroups: row.mappedLdapGroups,
                mappedOidcGroups: row.mappedOidcGroups,
                managedUsers: row.managedUsers,
                ldapUsers: row.ldapUsers,
                oidcUsers: row.oidcUsers,
                labelIcon: {
                  dataOn: '\u2713',
                  dataOff: '\u2715',
                },
              };
            },
            computed: {
              sortedApiKeys() {
                return Object.keys(this.apiKeys).sort((a, b) => {
                  return (
                    new Date(this.apiKeys[a].created) -
                    new Date(this.apiKeys[b].created)
                  );
                });
              },
            },
            methods: {
              apiKeysToDict: function (apiKeys) {
                const dict = {};
                apiKeys.forEach((item) => {
                  dict[item.publicId] = item;
                });
                return dict;
              },
              updateTeam: function () {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
                this.axios
                  .post(url, {
                    uuid: this.team.uuid,
                    name: this.name,
                  })
                  .then((response) => {
                    this.team = response.data;
                    EventBus.$emit('admin:teams:rowUpdate', index, this.team);
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              deleteTeam: function () {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
                this.axios
                  .delete(url, {
                    data: {
                      uuid: this.team.uuid,
                    },
                  })
                  .then((response) => {
                    EventBus.$emit('admin:teams:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.team_deleted'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              popup: function (title, message, key) {
                const h = this.$createElement;
                const titleVNode = h('div', {
                  domProps: { innerHTML: title },
                });
                const messageVNode = h('div', { class: ['foobar'] }, [
                  h('p', { class: ['text-center'] }, [message]),
                  h(
                    'pre',
                    {
                      class: [
                        'b-input-group-form-input',
                        'text-white',
                        'plaintext',
                      ],
                      style: { overflowX: 'auto' },
                    },
                    key,
                  ),
                ]);
                this.$bvModal.msgBoxOk([messageVNode], {
                  title: [titleVNode],
                  buttonSize: 'sm',
                  centered: true,
                  size: 'md',
                  footerClass: 'd-flex justify-content-center',
                  bodyClass: 'd-flex flex-column align-items-center',
                });
              },
              createApiKey: function () {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/${this.team.uuid}/key`;
                this.axios
                  .put(url)
                  .then((response) => {
                    if (!this.apiKeys) {
                      this.apiKeys = {};
                    }
                    this.$set(
                      this.apiKeys,
                      response.data.publicId,
                      response.data,
                    );
                    this.popup(
                      this.$t('admin.new_api_key_title'),
                      this.$t('admin.new_api_key'),
                      response.data.key,
                    );
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    console.info(error);
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              regenerateApiKey: function (apiKey) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/key/${apiKey.publicId}`;
                this.axios
                  .post(url)
                  .then((response) => {
                    this.$delete(this.apiKeys, apiKey.publicId);
                    this.$set(
                      this.apiKeys,
                      response.data.publicId,
                      response.data,
                    );

                    this.popup(
                      this.$t('admin.regenerate_api_key_title'),
                      this.$t('admin.regenerate_api_key'),
                      response.data.key,
                    );
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    console.info(error);
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              removeApiKey: function (apiKey) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/key/${apiKey.publicId}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    this.$delete(this.apiKeys, apiKey.publicId);
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    console.info(error);
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updateLdapGroupSelection: function (selections) {
                this.$root.$emit('bv::hide::modal', 'selectLdapGroupModal');
                for (let i = 0; i < selections.length; i++) {
                  const selection = selections[i];
                  const url = `${this.$api.BASE_URL}/${this.$api.URL_LDAP_MAPPING}`;
                  this.axios
                    .put(url, {
                      team: this.team.uuid,
                      dn: selection.dn,
                    })
                    .then((response) => {
                      if (
                        this.ldapGroups === undefined ||
                        this.ldapGroups === null
                      ) {
                        this.ldapGroups = [];
                      }
                      this.ldapGroups.push(response.data);
                      this.ldapGroups.sort();
                      this.$toastr.s(this.$t('message.updated'));
                    })
                    .catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(
                          this.$t('condition.unsuccessful_action'),
                        );
                      }
                    });
                }
              },
              removeLdapGroupMapping: function (mappingUuid) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_LDAP_MAPPING}/${mappingUuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    const k = [];
                    for (let i = 0; i < this.ldapGroups.length; i++) {
                      if (this.ldapGroups[i].uuid !== mappingUuid) {
                        k.push(this.ldapGroups[i]);
                      }
                    }
                    this.ldapGroups = k;
                    this.team.mappedLdapGroups = this.ldapGroups;
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updateOidcGroupSelection: function (selections) {
                this.$root.$emit('bv::hide::modal', 'selectOidcGroupModal');
                for (let i = 0; i < selections.length; i++) {
                  const selection = selections[i];
                  const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}`;
                  this.axios
                    .put(url, {
                      team: this.team.uuid,
                      group: selection.uuid,
                    })
                    .then((response) => {
                      if (
                        this.mappedOidcGroups === undefined ||
                        this.mappedOidcGroups === null
                      ) {
                        this.mappedOidcGroups = [];
                      }
                      this.mappedOidcGroups.push(response.data);
                      this.mappedOidcGroups.sort();
                      this.$toastr.s(this.$t('message.updated'));
                    })
                    .catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(
                          this.$t('condition.unsuccessful_action'),
                        );
                      }
                    });
                }
              },
              removeOidcGroupMapping: function (mappingUuid) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}/${mappingUuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    const k = [];
                    for (let i = 0; i < this.mappedOidcGroups.length; i++) {
                      if (this.mappedOidcGroups[i].uuid !== mappingUuid) {
                        k.push(this.mappedOidcGroups[i]);
                      }
                    }
                    this.mappedOidcGroups = k;
                    this.team.mappedOidcGroups = this.mappedOidcGroups;
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updatePermissionSelection: function (selections) {
                this.$root.$emit('bv::hide::modal', 'selectPermissionModal');
                for (let i = 0; i < selections.length; i++) {
                  const selection = selections[i];
                  const url = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${selection.name}/team/${this.team.uuid}`;
                  this.axios
                    .post(url)
                    .then((response) => {
                      this.syncVariables(response.data);
                      this.$toastr.s(this.$t('message.updated'));
                    })
                    .catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(
                          this.$t('condition.unsuccessful_action'),
                        );
                      }
                    });
                }
              },
              removePermission: function (permission) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${permission.name}/team/${this.team.uuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    this.syncVariables(response.data);
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              removeUser: function (user) {
                const url = `${this.$api.BASE_URL}/${this.$api.URL_USER}/${user.username}/membership`;
                this.axios
                  .delete(url, {
                    data: {
                      uuid: this.team.uuid,
                    },
                  })
                  .then((response) => {
                    if (this.managedUsers) {
                      const k = [];
                      for (let i = 0; i < this.managedUsers.length; i++) {
                        if (this.managedUsers[i].username !== user.username) {
                          k.push(this.managedUsers[i]);
                        }
                      }
                      this.managedUsers = k;
                    }
                    if (this.ldapUsers) {
                      const k = [];
                      for (let i = 0; i < this.ldapUsers.length; i++) {
                        if (this.ldapUsers[i].username !== user.username) {
                          k.push(this.ldapUsers[i]);
                        }
                      }
                      this.ldapUsers = k;
                    }
                    if (this.oidcUsers) {
                      const k = [];
                      for (let i = 0; i < this.oidcUsers.length; i++) {
                        if (this.oidcUsers[i].username !== user.username) {
                          k.push(this.oidcUsers[i]);
                        }
                      }
                      this.oidcUsers = k;
                    }
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              syncVariables: function (team) {
                this.team = team;
                if (team.apiKeys) {
                  // Some API server responses don't include API keys.
                  // Take care to not wipe existing API keys from the UI in those cases.
                  this.apiKeys = apiKeysToDict(team.apiKeys);
                }
                this.permissions = team.permissions;
                //this.ldapGroups = team.mappedLdapGroups;
              },
            },
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
  mounted() {
    EventBus.$on('admin:teams:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.$on('admin:teams:rowDeleted', (index, row) => {
      this.refreshTable();
    });
  },
  beforeDestroy() {
    EventBus.$off('admin:teams:rowUpdate');
    EventBus.$off('admin:teams:rowDeleted');
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
