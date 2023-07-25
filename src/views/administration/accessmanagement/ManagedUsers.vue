<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createManagedUserModal>
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
    <create-managed-user-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
import { CSwitch } from "@coreui/vue";
import xssFilters from "xss-filters";
import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
import i18n from "../../../i18n";
import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
import permissionsMixin from "../../../mixins/permissionsMixin";
import common from "../../../shared/common";
import EventBus from "../../../shared/eventbus";
import ActionableListGroupItem from "../../components/ActionableListGroupItem";
import ChangePasswordModal from "./ChangePasswordModal";
import CreateManagedUserModal from "./CreateManagedUserModal";
import SelectPermissionModal from "./SelectPermissionModal";
import SelectTeamModal from "./SelectTeamModal";

export default {
  props: {
    header: String
  },
  mixins: [bootstrapTableMixin],
  components: {
    CreateManagedUserModal
  },
  mounted() {
    EventBus.$on('admin:managedusers:rowUpdate', (index, row) => {
      this.$refs.table.updateRow( {index: index, row: row});
      this.$refs.table.expandRow(index);
    });
    EventBus.$on('admin:managedusers:rowDeleted', (index, row) => {
      this.refreshTable();
    });
  },
  beforeDestroy() {
    EventBus.$off('admin:managedusers:rowUpdate');
    EventBus.$off('admin:managedusers:rowDeleted');
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
          title: this.$t('message.fullname'),
          field: "fullname",
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
          }
        },
        {
          title: this.$t('message.email'),
          field: "email",
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
                  <b-input-group-form-input id="input-managed-user-fullname" :label="$t('message.fullname')" input-group-size="mb-3"
                                            required="true" type="text" v-model="fullname" lazy="true"
                                            v-debounce:750ms="updateUser" :debounce-events="'keyup'" />
                  <b-input-group-form-input id="input-managed-user-email" :label="$t('message.email')" input-group-size="mb-3"
                                            required="true" type="text" v-model="email" lazy="true"
                                            v-debounce:750ms="updateUser" :debounce-events="'keyup'" />
                  <CSwitch id="forcePasswordChange" color="primary" :checked.sync="forcePasswordChange" label />{{$t('admin.change_password_next_login')}}
                  <br/>
                  <CSwitch id="nonExpiryPassword" color="primary" :checked.sync="nonExpiryPassword" label />{{$t('admin.password_never_expires')}}
                  <br/>
                  <CSwitch id="suspended" color="primary" :checked.sync="suspended" label />{{$t('admin.suspended')}}
                  <div style="text-align:right">
                      <b-button variant="outline-primary" @click="$root.$emit('bv::show::modal', 'changePasswordModal')">{{ $t('admin.change_password') }}</b-button>
                      <b-button variant="outline-danger" @click="deleteUser">{{ $t('admin.delete_user') }}</b-button>
                  </div>
                </b-col>
                <select-team-modal v-on:selection="updateTeamSelection" />
                <select-permission-modal v-on:selection="updatePermissionSelection" />
                <change-password-modal :managed-user="managedUser" />
              </b-row>
            `,
            mixins: [permissionsMixin],
            components: {
              CSwitch,
              ActionableListGroupItem,
              SelectTeamModal,
              SelectPermissionModal,
              ChangePasswordModal,
              BInputGroupFormInput
            },
            data() {
              return {
                managedUser: row,
                username: row.username,
                teams: row.teams,
                permissions: row.permissions,
                fullname: row.fullname,
                email: row.email,
                forcePasswordChange: row.forcePasswordChange,
                nonExpiryPassword: row.nonExpiryPassword,
                suspended: row.suspended,
              }
            },
            watch: {
              forcePasswordChange() {
                this.updateUser();
              },
              nonExpiryPassword() {
                this.updateUser();
              },
              suspended() {
                this.updateUser();
              }
            },
            methods: {
              updateUser: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`;
                  this.axios.post(url, {
                    username: this.username,
                    fullname: this.fullname,
                    email: this.email,
                    newPassword: null,
                    confirmPassword: null,
                    forcePasswordChange: this.forcePasswordChange,
                    nonExpiryPassword: this.nonExpiryPassword,
                    suspended: this.suspended
                }).then((response) => {
                  this.manageduser = response.data;
                  EventBus.$emit('admin:managedusers:rowUpdate', index, this.manageduser);
                  this.$toastr.s(this.$t('message.updated'));
                }).catch((error) => {
                  this.$toastr.w(this.$t('condition.unsuccessful_action'));
                });
              },
              deleteUser: function() {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`;
                this.axios.delete(url, { data: {
                    username: this.username
                  }
                }).then((response) => {
                  EventBus.$emit('admin:managedusers:rowDeleted', index);
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
                    EventBus.$emit('admin:managedusers:rowUpdate', index, this.manageduser);
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
                  EventBus.$emit('admin:managedusers:rowUpdate', index, this.manageduser);
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
              syncVariables: function(managedUser) {
                this.manageduser = managedUser;
                this.username = managedUser.username;
                this.teams = managedUser.teams;
                this.permissions = managedUser.permissions;
                this.fullname = managedUser.fullname;
                this.email = managedUser.email;
                this.forcePasswordChange = managedUser.forcePasswordChange;
                this.nonExpiryPassword = managedUser.nonExpiryPassword;
                this.suspended = managedUser.suspended;
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
        url: `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`
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
