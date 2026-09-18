<template>
  <b-modal
    id="createWorkloadIdentityProviderModal"
    size="lg"
    hide-header-close
    no-stacking
    no-close-on-backdrop
    :title="$t('admin.create_workload_identity_provider')"
    @ok="onOk"
    @hidden="resetValues"
  >
    <b-form @submit.stop.prevent="onSubmit">
      <b-form-group
        :label="$t('message.name')"
        label-class="required"
        label-for="workload-identity-provider-name-input"
        :description="$t('admin.workload_identity_provider_name_description')"
        :invalid-feedback="$t('admin.workload_identity_provider_name_invalid')"
        :state="nameState"
      >
        <b-form-input
          id="workload-identity-provider-name-input"
          v-model="name"
          maxlength="63"
          type="text"
          autofocus
          required
          trim
          :state="nameState"
        />
      </b-form-group>
      <b-form-group
        :label="$t('message.type')"
        label-class="required"
        :description="$t('admin.workload_identity_provider_type_description')"
      >
        <b-form-radio-group
          v-model="type"
          :options="typeOptions"
          buttons
          button-variant="outline-primary"
        />
      </b-form-group>
      <b-form-group
        :label="$t('admin.workload_identity_issuer')"
        label-class="required"
        label-for="workload-identity-provider-issuer-input"
        :description="issuerDescription"
      >
        <b-form-input
          id="workload-identity-provider-issuer-input"
          v-model="issuer"
          maxlength="255"
          type="text"
          required
          trim
          :placeholder="issuerPlaceholder"
        />
      </b-form-group>
      <b-form-group
        :label="$t('admin.workload_identity_audience')"
        label-class="required"
        label-for="workload-identity-provider-audience-input"
        :description="$t('admin.workload_identity_audience_description')"
      >
        <b-form-input
          id="workload-identity-provider-audience-input"
          v-model="audience"
          maxlength="255"
          type="text"
          required
          trim
          placeholder="https://dependencytrack.example.com"
        />
      </b-form-group>
      <b-form-group
        :label="$t('admin.workload_identity_key_source')"
        label-class="required"
      >
        <b-form-radio-group
          v-model="keySource"
          :options="keySourceOptions"
          stacked
        />
      </b-form-group>
      <b-form-group
        v-if="keySource === 'url'"
        :label="$t('admin.workload_identity_jwks_url')"
        label-for="workload-identity-provider-jwks-url-input"
        :description="jwksUrlDescription"
        :invalid-feedback="$t('admin.workload_identity_jwks_url_invalid')"
        :state="jwksUrlState"
      >
        <b-form-input
          id="workload-identity-provider-jwks-url-input"
          v-model="jwksUrl"
          maxlength="2048"
          type="url"
          required
          trim
          :state="jwksUrlState"
        />
      </b-form-group>
      <b-form-group
        v-if="keySource === 'inline'"
        :label="$t('admin.workload_identity_jwks')"
        label-for="workload-identity-provider-jwks-input"
        :description="$t('admin.workload_identity_jwks_description')"
        :invalid-feedback="$t('admin.workload_identity_jwks_invalid')"
        :state="jwksState"
      >
        <b-form-textarea
          id="workload-identity-provider-jwks-input"
          v-model="jwks"
          class="text-monospace"
          rows="6"
          placeholder='{ "keys": [ ... ] }'
          required
          :state="jwksState"
        />
      </b-form-group>
      <b-form-group
        :label="$t('admin.workload_identity_session_lifetime')"
        label-class="required"
        label-for="workload-identity-provider-lifetime-input"
        :description="
          $t('admin.workload_identity_session_lifetime_description')
        "
      >
        <b-form-input
          id="workload-identity-provider-lifetime-input"
          v-model.number="sessionLifetimeSeconds"
          type="number"
          :min="minSessionLifetime"
          :max="maxSessionLifetime"
          step="1"
          required
          :state="sessionLifetimeState"
        />
      </b-form-group>
      <button type="submit" style="display: none" />
    </b-form>
    <template v-slot:modal-footer="{ cancel, ok }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        :disabled="!isValid || submitting"
        @click="ok()"
        ><b-spinner v-if="submitting" small class="mr-1" />{{
          $t('message.create')
        }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import {
  PROVIDER_NAME_PATTERN,
  MIN_SESSION_LIFETIME_SECONDS,
  MAX_SESSION_LIFETIME_SECONDS,
  isValidSessionLifetime,
  isHttpsUrl,
  parseJwks,
} from './workloadIdentity';

export default {
  data() {
    return {
      name: '',
      type: 'OIDC',
      issuer: '',
      audience: '',
      keySource: 'discovery',
      jwksUrl: '',
      jwks: '',
      sessionLifetimeSeconds: 3600,
      submitting: false,
      minSessionLifetime: MIN_SESSION_LIFETIME_SECONDS,
      maxSessionLifetime: MAX_SESSION_LIFETIME_SECONDS,
    };
  },
  computed: {
    typeOptions() {
      return [
        { value: 'OIDC', text: 'OpenID Connect' },
        { value: 'SPIFFE', text: 'SPIFFE' },
      ];
    },
    keySourceOptions() {
      return [
        {
          value: 'discovery',
          text: this.$t('admin.workload_identity_key_source_discovery'),
          disabled: this.type !== 'OIDC',
        },
        {
          value: 'url',
          text: this.$t('admin.workload_identity_key_source_url'),
        },
        {
          value: 'inline',
          text: this.$t('admin.workload_identity_key_source_inline'),
        },
      ];
    },
    issuerDescription() {
      return this.type === 'SPIFFE'
        ? this.$t('admin.workload_identity_issuer_description_spiffe')
        : this.$t('admin.workload_identity_issuer_description_oidc');
    },
    issuerPlaceholder() {
      return this.type === 'SPIFFE'
        ? 'example.org'
        : 'https://token.actions.githubusercontent.com';
    },
    jwksUrlDescription() {
      return this.type === 'SPIFFE'
        ? this.$t('admin.workload_identity_jwks_url_description_spiffe')
        : this.$t('admin.workload_identity_jwks_url_description_oidc');
    },
    nameState() {
      if (!this.name) {
        return null;
      }
      return PROVIDER_NAME_PATTERN.test(this.name);
    },
    jwksUrlState() {
      return this.jwksUrl ? isHttpsUrl(this.jwksUrl) : null;
    },
    jwksState() {
      return this.jwks ? parseJwks(this.jwks) !== null : null;
    },
    sessionLifetimeState() {
      return isValidSessionLifetime(this.sessionLifetimeSeconds);
    },
    isValid() {
      return (
        this.nameState === true &&
        !!this.issuer &&
        !!this.audience &&
        (this.keySource !== 'url' || this.jwksUrlState === true) &&
        (this.keySource !== 'inline' || this.jwksState === true) &&
        isValidSessionLifetime(this.sessionLifetimeSeconds)
      );
    },
  },
  watch: {
    type(type) {
      if (type !== 'OIDC' && this.keySource === 'discovery') {
        this.keySource = 'url';
      }
    },
  },
  methods: {
    onOk(event) {
      event.preventDefault();
      this.onSubmit();
    },
    async onSubmit() {
      if (!this.isValid || this.submitting) {
        return;
      }
      this.submitting = true;
      try {
        await this.axios.post(
          `${this.$api.BASE_URL}/${this.$api.URL_WORKLOAD_IDENTITY_PROVIDER}`,
          {
            name: this.name,
            type: this.type,
            issuer: this.issuer,
            audience: this.audience,
            jwks_url: this.keySource === 'url' ? this.jwksUrl : undefined,
            jwks:
              this.keySource === 'inline' ? parseJwks(this.jwks) : undefined,
            session_lifetime_seconds: this.sessionLifetimeSeconds,
          },
        );
        this.$emit('refreshTable');
        this.$toastr.s(this.$t('admin.workload_identity_provider_created'));
        this.$bvModal.hide('createWorkloadIdentityProviderModal');
      } catch (error) {
        console.error(error);
      } finally {
        this.submitting = false;
      }
    },
    resetValues() {
      this.name = '';
      this.type = 'OIDC';
      this.issuer = '';
      this.audience = '';
      this.keySource = 'discovery';
      this.jwksUrl = '';
      this.jwks = '';
      this.sessionLifetimeSeconds = 3600;
    },
  },
};
</script>
