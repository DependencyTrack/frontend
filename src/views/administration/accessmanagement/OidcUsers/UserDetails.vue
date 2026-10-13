<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-form-group :label="this.$t('admin.team_membership')">
          <div class="list-group">
            <span v-for="team in teams" :key="team.name">
              <actionable-list-group-item
                :value="team.name"
                :delete-icon="true"
                v-on:actionClicked="removeTeamMembership(team.uuid)"
              />
            </span>
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="showSelectTeamModal = true"
            />
          </div>
        </b-form-group>
        <b-form-group :label="this.$t('admin.permissions')">
          <div class="list-group">
            <span v-for="permission in permissions" :key="permission.name">
              <actionable-list-group-item
                :value="permission.name"
                :delete-icon="true"
                v-on:actionClicked="removePermission(permission)"
              />
            </span>
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="showSelectPermissionModal = true"
            />
          </div>
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <div style="text-align: right">
          <b-button variant="outline-danger" @click="deleteUser">{{
            $t('admin.delete_user')
          }}</b-button>
        </div>
      </b-col>
    </b-row>
    <select-team-modal
      v-model="showSelectTeamModal"
      :currentTeams="teams"
      v-on:selection="updateTeamSelection"
    />
    <select-permission-modal
      v-model="showSelectPermissionModal"
      :currentPermissions="permissions"
      v-on:selection="updatePermissionSelection"
    />
  </div>
</template>
<script>
import permissionsMixin from '../../../../mixins/permissionsMixin';
import userManagementMixin from '../../../../mixins/userManagementMixin';
import ActionableListGroupItem from '../../../components/ActionableListGroupItem.vue';
import SelectPermissionModal from '../SelectPermissionModal.vue';
import SelectTeamModal from '../SelectTeamModal.vue';

export default {
  props: {
    index: { type: Number, required: true },
    row: { type: Object, required: true },
    rowEvents: { update: { type: String }, delete: { type: String } },
  },
  mixins: [permissionsMixin, userManagementMixin],
  components: {
    ActionableListGroupItem,
    SelectTeamModal,
    SelectPermissionModal,
  },
  data() {
    return {
      showSelectTeamModal: false,
      showSelectPermissionModal: false,
      username: this.row.username,
      teams: this.row.teams,
      permissions: this.row.permissions,
    };
  },
  methods: {
    deleteUser: function () {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_USER_OIDC}`;
      this._deleteUser(endpoint);
    },

    updateTeamSelection: function (selections) {
      this._updateTeamSelection(selections);
    },

    removeTeamMembership: function (teamUUID) {
      this._removeTeamMembership(teamUUID);
    },

    updatePermissionSelection: function (selections) {
      this._updatePermissionSelection(selections);
    },

    removePermission: function (permission) {
      this._removePermission(permission);
    },
  },
};
</script>
