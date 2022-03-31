<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createLdapUserModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_user') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <create-ldap-user-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import i18n from "../../../i18n";
  import CreateLdapUserModal from "./CreateLdapUserModal";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import EventBus from "../../../shared/eventbus";
  import ActionableListGroupItem from "../../components/ActionableListGroupItem";
  import SelectTeamModal from "./SelectTeamModal";
  import SelectPermissionModal from "./SelectPermissionModal";
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      CreateLdapUserModal
    },
    mounted() {
      EventBus.$on('admin:ldapusers:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('admin:ldapusers:rowDeleted', (index, row) => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('admin:ldapusers:rowUpdate');
      EventBus.$off('admin:ldapusers:rowDeleted');
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.username'),
            field: "username",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.distinguished_name'),
            field: "dn",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.teams'),
            field: "teams",
            sortable: false,
            formatter(value, row, index) {
              return (value) ? xssFilters.inHTMLData(common.valueWithDefault(value.length, "0")) : 0;
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
                    <b-form-group :label="this.$t('admin.team_membership')">
                      <div class="list-group">
                        <span v-for="team in teams">
                          <actionable-list-group-item :value="team.name" :delete-icon="true" v-on:actionClicked="removeTeamMembership(team.uuid)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectTeamModal')"/>
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
                  </b-col>
                  <b-col sm="6">
                    <div style="text-align:right">
                       <b-button variant="outline-danger" @click="deleteUser">{{ $t('admin.delete_user') }}</b-button>
                    </div>
                  </b-col>
                  <select-team-modal v-on:selection="updateTeamSelection" />
                  <select-permission-modal v-on:selection="updatePermissionSelection" />
                </b-row>
              `,
              mixins: [permissionsMixin],
              components: {
                ActionableListGroupItem,
                SelectTeamModal,
                SelectPermissionModal
              },
              data() {
                return {
                  ldapUser: row,
                  username: row.username,
                  teams: row.teams,
                  permissions: row.permissions
                }
              },
              methods: {
                deleteUser: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_LDAP}`;
                  this.axios.delete(url, { data: {
                      username: this.username
                    }
                  }).then((response) => {
                    EventBus.$emit('admin:ldapusers:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.user_deleted'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updateTeamSelection: function(selections) {
                  this.$root.$emit('bv::hide::modal', 'selectTeamModal');
                  for (let i=0; i<selections.length; i++) {
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_USER}/${this.username}/membership`;
                    this.axios.post(url, {
                      uuid: selection.uuid
                    }).then((response) => {
                      this.syncVariables(response.data);
                      EventBus.$emit('admin:ldapusers:rowUpdate', index, this.ldapUser);
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
                removeTeamMembership: function(teamUuid) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_USER}/${this.username}/membership`;
                  this.axios.delete(url, { data: { uuid: teamUuid }
                  }).then((response) => {
                    this.syncVariables(response.data);
                    EventBus.$emit('admin:ldapusers:rowUpdate', index, this.ldapUser);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updatePermissionSelection: function(selections) {
                  this.$root.$emit('bv::hide::modal', 'selectPermissionModal');
                  for (let i=0; i<selections.length; i++) {
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${selection.name}/user/${this.username}`;
                    this.axios.post(url
                    ).then((response) => {
                      this.syncVariables(response.data);
                      this.$toastr.s(this.$t('message.updated'));
                    }).catch((error) => {
                      console.log(error);
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      }
                    });
                  }
                },
                removePermission: function(permission) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${permission.name}/user/${this.username}`;
                  this.axios.delete(url).then((response) => {
                    this.syncVariables(response.data);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                syncVariables: function(ldapUser) {
                  this.ldapUser = ldapUser;
                  this.username = ldapUser.username;
                  this.teams = ldapUser.teams;
                  this.permissions = ldapUser.permissions;
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
          url: `${this.$api.BASE_URL}/${this.$api.URL_USER_LDAP}`
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
