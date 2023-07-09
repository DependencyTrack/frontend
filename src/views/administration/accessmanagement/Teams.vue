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
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <create-team-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
  import i18n from "../../../i18n";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import common from "../../../shared/common";
  import EventBus from "../../../shared/eventbus";
  import ActionableListGroupItem from "../../components/ActionableListGroupItem";
  import CreateTeamModal from "./CreateTeamModal";
  import SelectLdapGroupModal from "./SelectLdapGroupModal";
  import SelectOidcGroupModal from "./SelectOidcGroupModal";
  import SelectPermissionModal from "./SelectPermissionModal";

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      CreateTeamModal
    },
    mounted() {
      EventBus.$on('admin:teams:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
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
    data() {
      return {
        columns: [
          {
            title: this.$t('admin.team_name'),
            field: "name",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.api_keys'),
            field: "apiKeys",
            sortable: false,
            formatter(value, row, index) {
              return (value) ? xssFilters.inHTMLData(common.valueWithDefault(value.length, "0")) : 0;
            }
          },
          {
            title: this.$t('admin.members'),
            field: "members",
            sortable: false,
            formatter(value, row, index) {
              let count = 0;
              if (row.managedUsers) {
                count += row.managedUsers.length;
              }
              if (row.ldapUsers) {
                count += row.ldapUsers.length;
              }
              return count;
            }
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
            refresh: 'fa-refresh'
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
                        <span v-for="apiKey in apiKeys">
                          <actionable-list-group-item :value="apiKey.key" :delete-icon="true" v-on:actionClicked="removeApiKey(apiKey)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="createApiKey()"/>
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
                ActionableListGroupItem,
                SelectLdapGroupModal,
                SelectOidcGroupModal,
                SelectPermissionModal,
                BInputGroupFormInput
              },
              data() {
                return {
                  team: row,
                  name: row.name,
                  apiKeys: row.apiKeys,
                  permissions: row.permissions,
                  ldapGroups: row.mappedLdapGroups,
                  mappedOidcGroups: row.mappedOidcGroups,
                  managedUsers: row.managedUsers,
                  ldapUsers: row.ldapUsers,
                }
              },
              methods: {
                updateTeam: function () {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
                  this.axios.post(url, {
                    uuid: this.team.uuid,
                    name: this.name,
                  }).then((response) => {
                    this.team = response.data;
                    EventBus.$emit('admin:teams:rowUpdate', index, this.team);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                deleteTeam: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
                  this.axios.delete(url, { data: {
                      uuid: this.team.uuid
                    }
                  }).then((response) => {
                    EventBus.$emit('admin:teams:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.team_deleted'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                createApiKey() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/${this.team.uuid}/key`;
                  this.axios.put(url).then((response) => {
                    if (this.apiKeys) {
                      this.apiKeys.push(response.data);
                    } else {
                      this.apiKeys = [response.data];
                    }
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                removeApiKey: function(apiKey) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/key/${apiKey.key}`;
                  this.axios.delete(url).then((response) => {
                    let k = [];
                    for (let i=0; i<this.apiKeys.length; i++) {
                      if (this.apiKeys[i].key !== apiKey.key) {
                        k.push(this.apiKeys[i]);
                      }
                    }
                    this.apiKeys = k;
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updateLdapGroupSelection: function(selections) {
                  this.$root.$emit('bv::hide::modal', 'selectLdapGroupModal');
                  for (let i=0; i<selections.length; i++) {
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_LDAP_MAPPING}`;
                    this.axios.put(url, {
                      team: this.team.uuid,
                      dn: selection.dn
                    }).then((response) => {
                      if (this.ldapGroups === undefined || this.ldapGroups === null) {
                        this.ldapGroups = [];
                      }
                      this.ldapGroups.push(response.data);
                      this.ldapGroups.sort();
                      this.$toastr.s(this.$t('message.updated'));
                    }).catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      }
                    });
                  }
                },
                removeLdapGroupMapping: function(mappingUuid) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_LDAP_MAPPING}/${mappingUuid}`;
                  this.axios.delete(url).then((response) => {
                    let k = [];
                    for (let i=0; i<this.ldapGroups.length; i++) {
                      if (this.ldapGroups[i].uuid !== mappingUuid) {
                        k.push(this.ldapGroups[i]);
                      }
                    }
                    this.ldapGroups = k;
                    this.team.mappedLdapGroups = this.ldapGroups;
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updateOidcGroupSelection: function(selections) {
                  this.$root.$emit('bv::hide::modal', 'selectOidcGroupModal');
                  for (let i=0; i<selections.length; i++) {
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}`;
                    this.axios.put(url, {
                      team: this.team.uuid,
                      group: selection.uuid
                    }).then((response) => {
                      if (this.mappedOidcGroups === undefined || this.mappedOidcGroups === null) {
                        this.mappedOidcGroups = [];
                      }
                      this.mappedOidcGroups.push(response.data);
                      this.mappedOidcGroups.sort();
                      this.$toastr.s(this.$t('message.updated'));
                    }).catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      }
                    });
                  }
                },
                removeOidcGroupMapping: function(mappingUuid) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}/${mappingUuid}`;
                  this.axios.delete(url).then((response) => {
                    let k = [];
                    for (let i=0; i<this.mappedOidcGroups.length; i++) {
                      if (this.mappedOidcGroups[i].uuid !== mappingUuid) {
                        k.push(this.mappedOidcGroups[i]);
                      }
                    }
                    this.mappedOidcGroups = k;
                    this.team.mappedOidcGroups = this.mappedOidcGroups;
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updatePermissionSelection: function(selections) {
                  this.$root.$emit('bv::hide::modal', 'selectPermissionModal');
                  for (let i=0; i<selections.length; i++) {
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${selection.name}/team/${this.team.uuid}`;
                    this.axios.post(url
                    ).then((response) => {
                      this.syncVariables(response.data);
                      this.$toastr.s(this.$t('message.updated'));
                    }).catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      }
                    });
                  }
                },
                removePermission: function(permission) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${permission.name}/team/${this.team.uuid}`;
                  this.axios.delete(url).then((response) => {
                    this.syncVariables(response.data);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                removeUser: function(user) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_USER}/${user.username}/membership`;
                  this.axios.delete(url, { data: {
                      uuid: this.team.uuid
                    }
                  }).then((response) => {
                    if (this.managedUsers) {
                      let k = [];
                      for (let i=0; i<this.managedUsers.length; i++) {
                        if (this.managedUsers[i].username !== user.username) {
                          k.push(this.managedUsers[i]);
                        }
                      }
                      this.managedUsers = k;
                    }
                    if (this.ldapUsers) {
                      let k = [];
                      for (let i=0; i<this.ldapUsers.length; i++) {
                        if (this.ldapUsers[i].username !== user.username) {
                          k.push(this.ldapUsers[i]);
                        }
                      }
                      this.ldapUsers = k;
                    }
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                syncVariables: function(team) {
                  this.team = team;
                  if (team.apiKeys) {
                    // Some API server responses don't include API keys.
                    // Take care to not wipe existing API keys from the UI in those cases.
                    this.apiKeys = team.apiKeys;
                  }
                  this.permissions = team.permissions;
                  //this.ldapGroups = team.mappedLdapGroups;
                }
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          toolbar: '#customToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`
        }
      };
    },
    methods: {
      refreshTable: function() {
        this.$refs.table.refresh({
          silent: true
        });
      }
    }
  }
</script>
