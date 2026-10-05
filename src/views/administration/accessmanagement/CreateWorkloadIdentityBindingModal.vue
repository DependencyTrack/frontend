<template>
  <b-modal
    :id="modalId"
    size="lg"
    hide-header-close
    no-close-on-backdrop
    :title="$t('admin.create_workload_identity_binding')"
    @show="onShow"
  >
    <p v-if="noProviders" class="text-muted">
      {{ $t('admin.workload_identity_no_providers') }}
    </p>
    <b-form v-else @submit.stop.prevent="createBinding">
      <b-form-group
        :label="$t('message.provider')"
        label-class="required"
        :label-for="`${modalId}-provider`"
      >
        <multiselect
          :id="`${modalId}-provider`"
          v-model="provider"
          :placeholder="$t('admin.select_workload_identity_provider')"
          :options="providers"
          :multiple="false"
          :searchable="true"
          :loading="loadingProviders"
          :internal-search="false"
          :close-on-select="true"
          :clear-on-select="false"
          :preserve-search="true"
          :max-height="250"
          track-by="name"
          label="name"
          open-direction="bottom"
          select-label=""
          deselect-label=""
          @search-change="onProviderSearchChange"
        >
          <template slot="option" slot-scope="{ option }">
            <strong>{{ option.name }}</strong>
            <small class="text-muted d-block"
              >{{ option.type }} &middot; {{ option.issuer }}</small
            >
          </template>
          <template slot="noResult">
            {{ $t('admin.no_workload_identity_providers_found') }}
          </template>
        </multiselect>
      </b-form-group>
      <b-form-group
        :label="$t('admin.workload_identity_subject')"
        label-class="required"
        :label-for="`${modalId}-subject`"
        :description="subjectDescription"
        :invalid-feedback="subjectInvalidFeedback"
        :state="subjectState"
      >
        <b-form-input
          :id="`${modalId}-subject`"
          v-model="subject"
          class="text-monospace"
          maxlength="512"
          type="text"
          required
          trim
          :placeholder="subjectPlaceholder"
          :state="subjectState"
        />
      </b-form-group>
      <b-form-group
        :label="$t('message.condition')"
        :description="$t('admin.workload_identity_condition_description')"
      >
        <code-mirror-editor
          :value="condition"
          :markers="conditionMarkers"
          :completion-source="celCompletionSource"
          @input="onConditionInput"
          @save="createBinding"
        />
      </b-form-group>
    </b-form>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        :disabled="!isValid || submitting"
        @click="createBinding"
        >{{ $t('message.create') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import CodeMirrorEditor from '@/views/components/CodeMirrorEditor.vue';
import Multiselect from 'vue-multiselect';
import { createCelCompletionSource } from '@/views/policy/celCompletions';
import common from '@/shared/common';
import { celErrorsToMarkers } from '@/shared/utils';
import { SUBJECT_PATTERN } from './workloadIdentity';

export default {
  props: {
    name: { type: String, required: true },
  },
  components: {
    CodeMirrorEditor,
    Multiselect,
  },
  data() {
    return {
      providers: [],
      provider: null,
      noProviders: false,
      loadingProviders: false,
      searchDebounceTimer: null,
      subject: '',
      condition: '',
      conditionMarkers: [],
      celCompletionSource: createCelCompletionSource(
        {
          claims: 'Claims',
          component: undefined,
          project: undefined,
          vulns: undefined,
          now: undefined,
        },
        [],
      ),
      submitting: false,
    };
  },
  computed: {
    modalId() {
      return `createWorkloadIdentityBindingModal-${this.name}`;
    },
    spiffeSubjectPrefix() {
      return this.provider && this.provider.type === 'SPIFFE'
        ? `spiffe://${this.provider.issuer.toLowerCase()}/`
        : null;
    },
    subjectDescription() {
      return this.spiffeSubjectPrefix
        ? this.$t('admin.workload_identity_subject_description_spiffe', {
            prefix: this.spiffeSubjectPrefix,
          })
        : this.$t('admin.workload_identity_subject_description_oidc');
    },
    subjectPlaceholder() {
      return this.spiffeSubjectPrefix
        ? `${this.spiffeSubjectPrefix}ns/ci/sa/*`
        : 'repo:acme-inc/app:ref:refs/heads/main';
    },
    subjectInvalidFeedback() {
      return this.spiffeSubjectPrefix
        ? this.$t('admin.workload_identity_subject_invalid_spiffe', {
            prefix: this.spiffeSubjectPrefix,
          })
        : this.$t('admin.workload_identity_subject_invalid');
    },
    subjectState() {
      if (!this.subject) {
        return null;
      }
      if (!SUBJECT_PATTERN.test(this.subject)) {
        return false;
      }
      if (this.spiffeSubjectPrefix) {
        return (
          this.subject.startsWith(this.spiffeSubjectPrefix) &&
          (!this.subject.endsWith('*') || this.subject.endsWith('/*'))
        );
      }
      return true;
    },
    isValid() {
      return !!this.provider && this.subjectState === true;
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchDebounceTimer);
  },
  methods: {
    async onShow() {
      this.provider = null;
      this.subject = '';
      this.condition = '';
      this.conditionMarkers = [];
      await this.loadProviders('');
      this.noProviders = this.providers.length === 0;
      if (this.providers.length === 1) {
        this.provider = this.providers[0];
      }
    },
    onProviderSearchChange(query) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(
        () => this.loadProviders(query),
        300,
      );
    },
    async loadProviders(query) {
      this.loadingProviders = true;
      const params = { limit: '10' };
      if (query) {
        params.q = query;
      }
      try {
        const response = await this.axios.get(
          common.setQueryParams(
            `${this.$api.BASE_URL}/${this.$api.URL_WORKLOAD_IDENTITY_PROVIDER}`,
            params,
          ),
        );
        this.providers = response.data.items;
      } catch (error) {
        this.providers = [];
        console.error(error);
      } finally {
        this.loadingProviders = false;
      }
    },
    onConditionInput(value) {
      this.condition = value;
      this.conditionMarkers = [];
    },
    async createBinding() {
      if (!this.isValid || this.submitting) {
        return;
      }
      this.submitting = true;
      const url = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE_ACCOUNT}/${encodeURIComponent(this.name)}/workload-identity-bindings`;
      try {
        await this.axios.post(url, {
          provider_name: this.provider.name,
          subject: this.subject,
          condition: this.condition.trim() || undefined,
        });
        this.$emit('created');
        this.$toastr.s(this.$t('admin.workload_identity_binding_created'));
        this.$bvModal.hide(this.modalId);
      } catch (error) {
        const response = error.response;
        if (response && response.status === 400 && response.data) {
          this.conditionMarkers = celErrorsToMarkers(response.data.errors);
        }
        console.error(error);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
