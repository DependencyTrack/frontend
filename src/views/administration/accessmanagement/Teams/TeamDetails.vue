<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-input-group-form-input
          id="input-team-name"
          :label="$t('admin.team_name')"
          input-group-size="mb-3"
          required="true"
          type="text"
          v-model="name"
          lazy="true"
          autofocus="true"
          @keyup="debouncedUpdateTeam"
        />
        <b-form-group :label="this.$t('admin.api_keys')">
          <p class="text-muted small">
            {{ $t('admin.team_api_keys_description') }}
            <router-link to="/admin/accessManagement/serviceAccounts">{{
              $t('admin.team_api_keys_service_account_link')
            }}</router-link>
          </p>
          <div class="list-group">
            <api-key-list-group-item
              v-for="key in sortedApiKeys"
              :key="`${key}-${apiKeys[key].created}`"
              :api-key="apiKeys[key]"
              v-on:removeClicked="removeApiKey(apiKeys[key])"
              v-on:regenerateClicked="regenerateApiKey(apiKeys[key])"
              v-on:commentUpdated="
                (comment) =>
                  syncVariables('replaceKey', {
                    old: apiKeys[key],
                    new: { ...apiKeys[key], comment },
                  })
              "
            />
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="createApiKey()"
              :tooltip="$t('admin.new_api_key_title')"
            />
          </div>
        </b-form-group>
        <b-form-group :label="this.$t('admin.permissions')">
          <div class="list-group">
            <actionable-list-group-item
              v-for="permission in permissions"
              :key="permission.name"
              :value="permission.name"
              :delete-icon="true"
              v-on:actionClicked="removePermission(permission)"
            />
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="showSelectPermissionModal = true"
            />
          </div>
        </b-form-group>
        <b-form-group :label="this.$t('admin.mapped_ldap_groups')">
          <div class="list-group">
            <actionable-list-group-item
              v-for="ldapGroup in ldapGroups"
              :key="ldapGroup.uuid"
              :value="ldapGroup.dn"
              :delete-icon="true"
              v-on:actionClicked="removeLdapGroupMapping(ldapGroup.uuid)"
            />
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="showSelectLdapGroupModal = true"
            />
          </div>
        </b-form-group>
        <b-form-group :label="this.$t('admin.mapped_oidc_groups')">
          <div class="list-group">
            <actionable-list-group-item
              v-for="oidcGroup in mappedOidcGroups"
              :key="oidcGroup.uuid"
              :value="oidcGroup.group.name"
              :delete-icon="true"
              v-on:actionClicked="removeOidcGroupMapping(oidcGroup)"
            />
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="showSelectOidcGroupModal = true"
            />
          </div>
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-form-group
          v-if="managedUsers && managedUsers.length > 0"
          :label="this.$t('admin.managed_users')"
        >
          <div class="list-group">
            <actionable-list-group-item
              v-for="user in managedUsers"
              :key="user.username"
              :value="user.username"
              :delete-icon="true"
              v-on:actionClicked="removeUser(user, 'managedUsers')"
            />
          </div>
        </b-form-group>
        <b-form-group
          v-if="ldapUsers && ldapUsers.length > 0"
          :label="this.$t('admin.ldap_users')"
        >
          <div class="list-group">
            <actionable-list-group-item
              v-for="user in ldapUsers"
              :key="user.username"
              :value="user.username"
              :delete-icon="true"
              v-on:actionClicked="removeUser(user, 'ldapUsers')"
            />
          </div>
        </b-form-group>
        <b-form-group
          v-if="oidcUsers && oidcUsers.length > 0"
          :label="this.$t('admin.oidc_users')"
        >
          <div class="list-group">
            <actionable-list-group-item
              v-for="user in oidcUsers"
              :key="user.username"
              :value="user.username"
              :delete-icon="true"
              v-on:actionClicked="removeUser(user, 'oidcUsers')"
            />
          </div>
        </b-form-group>
        <b-form-group
          v-if="serviceAccounts && serviceAccounts.length > 0"
          :label="this.$t('admin.service_accounts')"
        >
          <div class="list-group">
            <actionable-list-group-item
              v-for="user in serviceAccounts"
              :key="user.username"
              :value="user.username"
              :delete-icon="true"
              v-on:actionClicked="removeUser(user, 'serviceAccounts')"
            />
          </div>
        </b-form-group>
        <div style="text-align: right">
          <b-button variant="outline-danger" @click="deleteTeam">{{
            $t('admin.delete_team')
          }}</b-button>
        </div>
      </b-col>
    </b-row>
    <select-permission-modal
      v-model="showSelectPermissionModal"
      :currentPermissions="permissions"
      v-on:selection="updatePermissionSelection"
    />
    <select-ldap-group-modal
      v-model="showSelectLdapGroupModal"
      v-on:selection="updateLdapGroupSelection"
    />
    <select-oidc-group-modal
      v-model="showSelectOidcGroupModal"
      v-on:selection="updateOidcGroupSelection"
    />
    <b-modal
      v-model="showApiKeyModal"
      :title="shownApiKey.title"
      ok-only
      button-size="sm"
      centered
      footer-class="d-flex justify-content-center"
      body-class="d-flex flex-column align-items-center"
    >
      <p class="text-center">{{ shownApiKey.message }}</p>
      <pre
        class="b-input-group-form-input plaintext"
        style="overflow-x: auto"
        >{{ shownApiKey.key }}</pre>
    </b-modal>
  </div>
</template>

<script>
import EventBus from '../../../../shared/eventbus';
import ActionableListGroupItem from '../../../components/ActionableListGroupItem.vue';
import ApiKeyListGroupItem from '../ApiKeyListGroupItem.vue';
import SelectLdapGroupModal from '../SelectLdapGroupModal.vue';
import SelectOidcGroupModal from '../SelectOidcGroupModal.vue';
import SelectPermissionModal from '../SelectPermissionModal.vue';
import permissionsMixin from '../../../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../../../forms/BInputGroupFormInput.vue';
import { debounce, omit } from 'lodash-es';

export default {
  mixins: [permissionsMixin],
  components: {
    ActionableListGroupItem,
    ApiKeyListGroupItem,
    SelectLdapGroupModal,
    SelectOidcGroupModal,
    SelectPermissionModal,
    BInputGroupFormInput,
  },
  props: {
    row: { type: Object, required: true },
    index: { type: Number, required: true },
    rowEvents: { update: { type: String }, delete: { type: String } },
  },
  data() {
    return {
      showSelectPermissionModal: false,
      showSelectLdapGroupModal: false,
      showSelectOidcGroupModal: false,
      showApiKeyModal: false,
      shownApiKey: {},
      team: this.row,
      name: this.row.name,
      apiKeys: this.apiKeysToDict(this.row.apiKeys ?? []),
      permissions: this.row.permissions,
      ldapGroups: this.row.mappedLdapGroups,
      mappedOidcGroups: this.row.mappedOidcGroups,
      managedUsers: this.row.managedUsers,
      ldapUsers: this.row.ldapUsers,
      oidcUsers: this.row.oidcUsers,
      serviceAccounts: this.row.serviceAccounts,
      storageIdentifier: `TeamDetail:${this.row.uuid}`,
    };
  },
  beforeMount() {
    console.log('initializing team details');
    console.log(this.row.apiKeys);
    console.log(this.apiKeys);
    const modified = sessionStorage.getItem(this.storageIdentifier);
    if (modified) {
      sessionStorage.removeItem(this.storageIdentifier);
      this.reloadTeam();
    }
  },
  watch: {
    team: {
      handler(newValue) {
        console.log(`team %O`, newValue);
        this.name = newValue.name;
        this.apiKeys = this.apiKeysToDict(newValue.apiKeys ?? []);
        this.permissions = newValue.permissions;
        this.ldapGroups = newValue.mappedLdapGroups;
        this.mappedOidcGroups = newValue.mappedOidcGroups;
        this.managedUsers = newValue.managedUsers;
        this.ldapUsers = newValue.ldapUsers;
        this.oidcUsers = newValue.oidcUsers;
        this.serviceAccounts = newValue.serviceAccounts;
      },
      deep: true,
    },
  },
  computed: {
    sortedApiKeys() {
      return Object.keys(this.apiKeys).sort(
        (a, b) =>
          new Date(this.apiKeys[a].created) - new Date(this.apiKeys[b].created),
      );
    },
  },
  created() {
    this.debouncedUpdateTeam = debounce(this.updateTeam, 750);
  },
  methods: {
    apiKeysToDict: function (apiKeys) {
      return Object.fromEntries(apiKeys.map((item) => [item.publicId, item]));
    },
    updateTeam: async function () {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
      const requestBody = { uuid: this.team.uuid, name: this.name };
      try {
        const response = await this.axios.post(endpoint, requestBody);
        this.team = response.data;
        EventBus.emit(this.rowEvents.update, this.index, this.team);
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    deleteTeam: async function () {
      if (!(await this.$confirmDelete({ title: this.$t('admin.delete_team') })))
        return;
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
      const requestBody = { data: { uuid: this.team.uuid } };
      try {
        await this.axios.delete(endpoint, requestBody);
        EventBus.emit(this.rowEvents.delete, this.index);
        this.$toastr.s(this.$t('admin.team_deleted'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    popup: function (title, message, key) {
      this.shownApiKey = { title, message, key };
      this.showApiKeyModal = true;
    },
    async createApiKey() {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/${this.team.uuid}/key`;
      try {
        const response = await this.axios.put(endpoint);
        this.$toastr.s(this.$t('message.updated'));
        this.popup(
          this.$t('admin.new_api_key_title'),
          this.$t('admin.new_api_key'),
          response.data.key,
        );
        this.syncVariables('addKey', response.data);
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    async regenerateApiKey(apiKey) {
      const confirmed = await this.$confirm(
        this.$t('admin.regenerate_api_key_confirm'),
        {
          title: this.$t('admin.regenerate_api_key_title'),
          okVariant: 'danger',
          okTitle: this.$t('message.regenerate'),
          cancelTitle: this.$t('message.cancel'),
          centered: true,
        },
      );
      if (!confirmed) return;
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/key/${apiKey.publicId}`;
      try {
        const response = await this.axios.post(endpoint);
        this.$toastr.s(this.$t('message.updated'));
        this.popup(
          this.$t('admin.regenerate_api_key_title'),
          this.$t('admin.regenerate_api_key'),
          response.data.key,
        );
        this.syncVariables('replaceKey', { old: apiKey, new: response.data });
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    removeApiKey: async function (apiKey) {
      if (
        !(await this.$confirmDelete({
          title: this.$t('admin.remove_api_key'),
          message: this.$t('admin.remove_api_key_confirm'),
        }))
      )
        return;
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/key/${apiKey.publicId}`;
      try {
        await this.axios.delete(endpoint);
        this.syncVariables('removeKey', apiKey);
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    updateLdapGroupSelection: async function (selections) {
      this.showSelectLdapGroupModal = false;
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_LDAP_MAPPING}`;
      try {
        const responses = await Promise.all(
          selections.map((selection) =>
            this.axios.put(endpoint, {
              team: this.team.uuid,
              dn: selection.dn,
            }),
          ),
        );
        responses.forEach((response) => {
          this.syncVariables('addLdapMapping', response.data);
        });
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        if (error.response && error.response.status === 304) {
          // Optionally handle 304
        } else {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        }
      }
    },
    removeLdapGroupMapping: async function (mapping) {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_LDAP_MAPPING}/${mapping}`;
      try {
        await this.axios.delete(endpoint);
        this.syncVariables('removeLdapMapping', mapping);
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    updateOidcGroupSelection: async function (selections) {
      this.showSelectOidcGroupModal = false;
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}`;
      try {
        const responses = await Promise.all(
          selections.map((selection) => {
            const requestBody = { team: this.team.uuid, group: selection.uuid };
            return this.axios.put(endpoint, requestBody);
          }),
        );
        responses.forEach((response) => {
          this.syncVariables('addOidcMapping', response.data);
        });
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    removeOidcGroupMapping: async function (mapping) {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}/${mapping.uuid}`;
      try {
        await this.axios.delete(endpoint);
        this.syncVariables('removeOidcMapping', mapping);
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    updatePermissionSelection: async function (selections) {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM_PERMISSION}`;
      const requestBody = {
        team: this.team.uuid,
        permissions: selections.map((selection) => selection.name),
      };

      try {
        const response = await this.axios.put(endpoint, requestBody);
        this.syncVariables('team', response.data);
        this.$toastr.s(this.$t('admin.permissions_updated'));
      } catch (error) {
        console.error(error);
        if (error.response.status === 304) return;
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    removePermission: async function (permission) {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_PERMISSION}/${permission.name}/team/${this.team.uuid}`;
      try {
        const response = await this.axios.delete(endpoint);
        this.syncVariables('team', response.data);
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    removeUser: async function (user, group) {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_USER}/${user.username}/membership`;
      const requestBody = { data: { uuid: this.team.uuid } };
      try {
        await this.axios.delete(endpoint, requestBody);
        this.syncVariables('removeUser', { user, group });
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    reloadTeam: async function () {
      const endpoint = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/${this.team.uuid}`;
      try {
        const response = await this.axios.get(endpoint);
        response.data.permissions = response.data.permissions ?? [];
        response.data.apiKeys = response.data.apiKeys ?? [];
        EventBus.emit(this.rowEvents.update, this.index, response.data);
      } catch (error) {
        console.error(error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    syncVariables: function (type = 'team', data = null) {
      // arr acts as the existing property on the team instance,
      // updater specifies how it should be modified
      const updateTeamArray = (prop, updater) => {
        const arr = this.team[prop] ?? [];
        const result = updater(arr);
        this.team = { ...this.team, [prop]: result };
      };

      // operations that should be done on the team instance
      const handlers = {
        team: () => {
          data.permissions = data.permissions ?? [];
          data.apiKeys = data.apiKeys ?? [];
          this.team = data;
        },
        addKey: () => {
          updateTeamArray('apiKeys', (arr) => [...arr, omit(data, 'key')]);
        },
        removeKey: () => {
          updateTeamArray('apiKeys', (arr) =>
            arr.filter((key) => key.publicId !== data.publicId),
          );
        },
        replaceKey: () => {
          const updater = (arr) =>
            arr.map((key) =>
              key.publicId === data.old.publicId ? omit(data.new, 'key') : key,
            );
          updateTeamArray('apiKeys', updater);
        },
        addLdapMapping: () => {
          updateTeamArray('mappedLdapGroups', (arr) => [...arr, data].sort());
        },
        removeLdapMapping: () => {
          updateTeamArray('mappedLdapGroups', (arr) =>
            arr.filter((mapping) => mapping.dn !== data),
          );
        },
        addOidcMapping: () => {
          updateTeamArray('mappedOidcGroups', (arr) => [...arr, data].sort());
        },
        removeOidcMapping: () => {
          updateTeamArray('mappedOidcGroups', (arr) =>
            arr.filter((mapping) => mapping.uuid !== data.uuid),
          );
        },
        removeUser: () => {
          const { user, group } = data;
          updateTeamArray(group, (arr) =>
            arr.filter((u) => u.username !== user.username),
          );
        },
      };

      if (!type || typeof handlers[type] !== 'function') {
        console.error('Unknown or missing type for syncVariables', type);
        return;
      }

      handlers[type]();
      sessionStorage.setItem(this.storageIdentifier, new Date().toString());
    },
  },
};
</script>
