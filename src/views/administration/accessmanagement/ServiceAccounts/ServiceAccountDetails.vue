<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-form-group :label="$t('admin.api_keys')">
          <div class="list-group">
            <api-key-list-group-item
              v-for="apiKey in apiKeys"
              :key="apiKey.publicId"
              :api-key="apiKey"
              :editable="false"
              v-on:removeClicked="removeApiKey(apiKey)"
            />
            <actionable-list-group-item
              v-if="!suspended"
              :add-icon="true"
              :tooltip="$t('admin.new_api_key_title')"
              v-on:actionClicked="openCreateApiKeyModal()"
            />
          </div>
        </b-form-group>
        <b-form-group :label="$t('admin.workload_identity_bindings')">
          <div class="list-group">
            <workload-identity-binding-list-group-item
              v-for="binding in workloadIdentityBindings"
              :key="binding.uuid"
              :binding="binding"
              v-on:removeClicked="removeWorkloadIdentityBinding(binding)"
            />
            <actionable-list-group-item
              :add-icon="true"
              :tooltip="$t('admin.create_workload_identity_binding')"
              v-on:actionClicked="
                $bvModal.show(`createWorkloadIdentityBindingModal-${row.name}`)
              "
            />
          </div>
        </b-form-group>
        <b-form-group :label="$t('admin.team_membership')">
          <div class="list-group">
            <actionable-list-group-item
              v-for="team in teams"
              :key="team.uuid"
              :tooltip="$t('admin.remove_team_membership')"
              :value="team.name"
              :delete-icon="true"
              v-on:actionClicked="removeTeamMembership(team.uuid)"
            />
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="
                $root.$emit('bv::show::modal', 'selectTeamModal')
              "
            />
          </div>
        </b-form-group>
        <b-form-group :label="$t('admin.permissions')">
          <div class="list-group">
            <actionable-list-group-item
              v-for="permission in permissions"
              :key="permission.name"
              :tooltip="$t('admin.remove_permission')"
              :value="permission.name"
              :delete-icon="true"
              v-on:actionClicked="removePermission(permission)"
            />
            <actionable-list-group-item
              :add-icon="true"
              v-on:actionClicked="
                $root.$emit('bv::show::modal', 'selectPermissionModal')
              "
            />
          </div>
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-input-group-form-input
          id="input-service-account-username"
          :label="$t('message.username')"
          input-group-size="mb-3"
          type="text"
          :value="row.username"
          :readonly="true"
        />
        <b-input-group-form-input
          id="input-service-account-email"
          :label="$t('message.email')"
          input-group-size="mb-3"
          type="text"
          v-model="email"
        />
        <c-switch
          id="suspended"
          color="primary"
          v-model="suspended"
          label
          v-bind="labelIcon"
        />{{ $t('admin.suspended') }}
        <p class="text-muted small mt-2">
          {{ $t('admin.service_account_suspend_description') }}
        </p>
        <div style="text-align: right">
          <b-button
            variant="outline-primary"
            :disabled="!hasChanges"
            @click="updateServiceAccount"
            >{{ $t('message.update') }}</b-button
          >
          <b-button
            class="ml-2"
            variant="outline-danger"
            @click="deleteServiceAccount"
            >{{ $t('message.delete') }}</b-button
          >
        </div>
      </b-col>
    </b-row>
    <template v-if="loaded">
      <select-team-modal
        :currentTeams="teams"
        v-on:selection="updateTeamSelection"
      />
      <select-permission-modal
        :currentPermissions="permissions"
        v-on:selection="updatePermissionSelection"
      />
    </template>
    <create-service-account-api-key-modal
      :name="row.name"
      v-on:created="loadApiKeys"
    />
    <create-workload-identity-binding-modal
      :name="row.name"
      v-on:created="loadWorkloadIdentityBindings"
    />
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import ActionableListGroupItem from '../../../components/ActionableListGroupItem.vue';
import ApiKeyListGroupItem from '../ApiKeyListGroupItem.vue';
import CreateServiceAccountApiKeyModal from '../CreateServiceAccountApiKeyModal.vue';
import CreateWorkloadIdentityBindingModal from '../CreateWorkloadIdentityBindingModal.vue';
import WorkloadIdentityBindingListGroupItem from '../WorkloadIdentityBindingListGroupItem.vue';
import SelectTeamModal from '../SelectTeamModal.vue';
import SelectPermissionModal from '../SelectPermissionModal.vue';
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import { fetchAllPages } from '@/shared/utils';
import userManagementMixin from '../../../../mixins/userManagementMixin';
import EventBus from '../../../../shared/eventbus';
import i18n from '../../../../i18n';

export default {
  i18n,
  props: {
    index: { type: Number, required: true },
    row: { type: Object, required: true },
    rowEvents: { update: { type: String }, delete: { type: String } },
  },
  mixins: [userManagementMixin],
  components: {
    cSwitch,
    ActionableListGroupItem,
    ApiKeyListGroupItem,
    CreateServiceAccountApiKeyModal,
    CreateWorkloadIdentityBindingModal,
    WorkloadIdentityBindingListGroupItem,
    SelectTeamModal,
    SelectPermissionModal,
    BInputGroupFormInput,
  },
  data() {
    return {
      email: this.row.email,
      suspended: this.row.suspended,
      teams: [],
      permissions: [],
      apiKeys: [],
      workloadIdentityBindings: [],
      loaded: false,
      labelIcon: {
        dataOn: '✓',
        dataOff: '✕',
      },
    };
  },
  computed: {
    hasChanges() {
      return (
        (this.email || '') !== (this.row.email || '') ||
        this.suspended !== this.row.suspended
      );
    },
    serviceAccountUrl() {
      return `${this.$api.BASE_URL}/${this.$api.URL_SERVICE_ACCOUNT}/${encodeURIComponent(this.row.name)}`;
    },
  },
  async mounted() {
    await Promise.all([
      this.loadServiceAccount(),
      this.loadApiKeys(),
      this.loadWorkloadIdentityBindings(),
    ]);
  },
  methods: {
    async loadServiceAccount() {
      try {
        const response = await this.axios.get(this.serviceAccountUrl);
        this.teams = response.data.teams;
        this.permissions = response.data.permissions.map((name) => ({ name }));
        this.loaded = true;
      } catch (error) {
        console.error(error);
      }
    },
    async loadApiKeys() {
      try {
        const apiKeys = await fetchAllPages(
          this.axios,
          `${this.serviceAccountUrl}/api-keys`,
        );
        this.apiKeys = apiKeys.map((apiKey) => ({
          publicId: apiKey.public_id,
          comment: apiKey.comment,
          created: apiKey.created_at,
          lastUsed: apiKey.last_used_at,
          expiresAt: apiKey.expires_at,
        }));
      } catch (error) {
        console.error(error);
      }
    },
    async loadWorkloadIdentityBindings() {
      try {
        this.workloadIdentityBindings = await fetchAllPages(
          this.axios,
          `${this.serviceAccountUrl}/workload-identity-bindings`,
        );
      } catch (error) {
        console.error(error);
      }
    },
    async updateServiceAccount() {
      try {
        await this.axios.patch(this.serviceAccountUrl, {
          email: this.email || '',
          suspended: this.suspended,
        });
        EventBus.$emit(this.rowEvents.update, this.index, {
          email: this.email || null,
          suspended: this.suspended,
        });
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
      }
    },
    async deleteServiceAccount() {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        this.$t('admin.delete_service_account_confirm'),
        {
          title: this.$t('admin.delete_service_account'),
          okVariant: 'danger',
          okTitle: this.$t('message.delete'),
          cancelTitle: this.$t('message.cancel'),
          centered: true,
        },
      );
      if (!confirmed) return;
      try {
        await this.axios.delete(this.serviceAccountUrl);
        EventBus.$emit(this.rowEvents.delete, this.index);
        this.$toastr.s(this.$t('admin.service_account_deleted'));
      } catch (error) {
        console.error(error);
      }
    },
    openCreateApiKeyModal() {
      this.$bvModal.show(`createServiceAccountApiKeyModal-${this.row.name}`);
    },
    async removeApiKey(apiKey) {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        this.$t('admin.remove_api_key_confirm'),
        {
          title: this.$t('admin.remove_api_key'),
          okVariant: 'danger',
          okTitle: this.$t('message.delete'),
          cancelTitle: this.$t('message.cancel'),
          centered: true,
        },
      );
      if (!confirmed) return;
      try {
        await this.axios.delete(
          `${this.serviceAccountUrl}/api-keys/${encodeURIComponent(apiKey.publicId)}`,
        );
        this.apiKeys = this.apiKeys.filter(
          (key) => key.publicId !== apiKey.publicId,
        );
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
      }
    },
    async removeWorkloadIdentityBinding(binding) {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        this.$t('admin.remove_workload_identity_binding_confirm'),
        {
          title: this.$t('admin.remove_workload_identity_binding'),
          okVariant: 'danger',
          okTitle: this.$t('message.delete'),
          cancelTitle: this.$t('message.cancel'),
          centered: true,
        },
      );
      if (!confirmed) return;
      try {
        await this.axios.delete(
          `${this.serviceAccountUrl}/workload-identity-bindings/${encodeURIComponent(binding.uuid)}`,
        );
        this.workloadIdentityBindings = this.workloadIdentityBindings.filter(
          (b) => b.uuid !== binding.uuid,
        );
        this.$toastr.s(this.$t('admin.workload_identity_binding_removed'));
      } catch (error) {
        console.error(error);
      }
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
