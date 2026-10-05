<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-input-group-form-input
          id="input-workload-identity-provider-name"
          :label="$t('message.name')"
          input-group-size="mb-3"
          type="text"
          :value="row.name"
          :readonly="true"
        />
        <b-input-group-form-input
          id="input-workload-identity-provider-type"
          :label="$t('message.type')"
          input-group-size="mb-3"
          type="text"
          :value="row.type"
          :readonly="true"
        />
        <b-form-group
          :label="$t('admin.workload_identity_issuer')"
          :label-for="`${idPrefix}-issuer`"
          :description="issuerDescription"
        >
          <b-form-input
            :id="`${idPrefix}-issuer`"
            v-model="issuer"
            maxlength="255"
            type="text"
            trim
          />
        </b-form-group>
        <b-form-group
          :label="$t('admin.workload_identity_audience')"
          :label-for="`${idPrefix}-audience`"
          :description="$t('admin.workload_identity_audience_description')"
        >
          <b-form-input
            :id="`${idPrefix}-audience`"
            v-model="audience"
            maxlength="255"
            type="text"
            trim
          />
        </b-form-group>
        <b-form-group
          :label="$t('admin.workload_identity_session_lifetime')"
          :label-for="`${idPrefix}-lifetime`"
          :description="
            $t('admin.workload_identity_session_lifetime_description')
          "
        >
          <b-form-input
            :id="`${idPrefix}-lifetime`"
            v-model.number="sessionLifetimeSeconds"
            type="number"
            :min="minSessionLifetime"
            :max="maxSessionLifetime"
            step="1"
            :state="sessionLifetimeState"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-form-group :label="$t('admin.workload_identity_key_source')">
          <b-form-radio-group
            v-model="keySource"
            :options="keySourceOptions"
            stacked
          />
        </b-form-group>
        <b-form-group
          v-if="keySource === 'url'"
          :label="$t('admin.workload_identity_jwks_url')"
          :label-for="`${idPrefix}-jwks-url`"
          :invalid-feedback="$t('admin.workload_identity_jwks_url_invalid')"
          :state="jwksUrlState"
        >
          <b-form-input
            :id="`${idPrefix}-jwks-url`"
            v-model="jwksUrl"
            maxlength="2048"
            type="url"
            trim
            :state="jwksUrlState"
          />
        </b-form-group>
        <b-form-group
          v-if="keySource === 'inline'"
          :label="$t('admin.workload_identity_jwks')"
          :label-for="`${idPrefix}-jwks`"
          :description="$t('admin.workload_identity_jwks_replace_description')"
          :invalid-feedback="$t('admin.workload_identity_jwks_invalid')"
          :state="jwksState"
        >
          <p v-if="row.jwks_key_ids" class="small mb-2">
            <span class="text-muted"
              >{{ $t('admin.workload_identity_key_ids') }}:</span
            >
            <b-badge
              v-for="keyId in row.jwks_key_ids"
              :key="keyId"
              variant="secondary"
              class="text-monospace ml-1"
              >{{ keyId }}</b-badge
            >
          </p>
          <b-form-textarea
            :id="`${idPrefix}-jwks`"
            v-model="jwks"
            class="text-monospace"
            rows="6"
            placeholder='{ "keys": [ ... ] }'
            :state="jwksState"
          />
        </b-form-group>
        <p v-if="issuerChangeHint" class="text-muted small">
          <i class="fa fa-info-circle" aria-hidden="true"></i>
          {{ issuerChangeHint }}
        </p>
        <div style="text-align: right">
          <b-button
            variant="outline-primary"
            :disabled="!hasChanges || !isValid || submitting"
            @click="updateProvider"
            ><b-spinner v-if="submitting" small class="mr-1" />{{
              $t('message.update')
            }}</b-button
          >
          <b-button
            class="ml-2"
            variant="outline-danger"
            @click="deleteProvider"
            >{{ $t('message.delete') }}</b-button
          >
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import EventBus from '../../../../shared/eventbus';
import i18n from '../../../../i18n';
import {
  MIN_SESSION_LIFETIME_SECONDS,
  MAX_SESSION_LIFETIME_SECONDS,
  isValidSessionLifetime,
  isHttpsUrl,
  parseJwks,
} from '../workloadIdentity';

export default {
  i18n,
  props: {
    index: { type: Number, required: true },
    row: { type: Object, required: true },
    rowEvents: { update: { type: String }, delete: { type: String } },
  },
  components: {
    BInputGroupFormInput,
  },
  data() {
    return {
      issuer: this.row.issuer,
      audience: this.row.audience,
      keySource: this.row.jwks_key_ids ? 'inline' : 'url',
      jwksUrl: this.row.jwks_url || '',
      jwks: '',
      sessionLifetimeSeconds: this.row.session_lifetime_seconds,
      submitting: false,
      minSessionLifetime: MIN_SESSION_LIFETIME_SECONDS,
      maxSessionLifetime: MAX_SESSION_LIFETIME_SECONDS,
    };
  },
  computed: {
    idPrefix() {
      return `workload-identity-provider-${this.row.name}`;
    },
    providerUrl() {
      return `${this.$api.BASE_URL}/${this.$api.URL_WORKLOAD_IDENTITY_PROVIDER}/${encodeURIComponent(this.row.name)}`;
    },
    keySourceOptions() {
      return [
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
      return this.row.type === 'SPIFFE'
        ? this.$t('admin.workload_identity_issuer_description_spiffe')
        : this.$t('admin.workload_identity_issuer_description_oidc');
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
    sendsJwksUrl() {
      return (
        this.keySource === 'url' &&
        (!!this.row.jwks_key_ids || this.jwksUrl !== this.row.jwks_url)
      );
    },
    sendsJwks() {
      return this.keySource === 'inline' && !!this.jwks;
    },
    issuerChangeHint() {
      if (this.issuer === this.row.issuer) {
        return null;
      }
      if (this.row.type === 'SPIFFE') {
        return this.$t('admin.workload_identity_trust_domain_change');
      }
      return !this.row.jwks_key_ids && !this.sendsJwksUrl && !this.sendsJwks
        ? this.$t('admin.workload_identity_issuer_change_rediscovery')
        : null;
    },
    hasChanges() {
      return (
        this.issuer !== this.row.issuer ||
        this.audience !== this.row.audience ||
        this.sessionLifetimeSeconds !== this.row.session_lifetime_seconds ||
        this.sendsJwksUrl ||
        this.sendsJwks
      );
    },
    isValid() {
      return (
        !!this.issuer &&
        !!this.audience &&
        isValidSessionLifetime(this.sessionLifetimeSeconds) &&
        (this.keySource !== 'url' || this.jwksUrlState === true) &&
        (this.keySource !== 'inline' ||
          (this.jwks ? this.jwksState === true : !!this.row.jwks_key_ids))
      );
    },
  },
  methods: {
    async updateProvider() {
      this.submitting = true;
      try {
        await this.axios.patch(this.providerUrl, {
          issuer: this.issuer !== this.row.issuer ? this.issuer : undefined,
          audience:
            this.audience !== this.row.audience ? this.audience : undefined,
          session_lifetime_seconds:
            this.sessionLifetimeSeconds !== this.row.session_lifetime_seconds
              ? this.sessionLifetimeSeconds
              : undefined,
          jwks_url: this.sendsJwksUrl ? this.jwksUrl : undefined,
          jwks: this.sendsJwks ? parseJwks(this.jwks) : undefined,
        });
        const response = await this.axios.get(this.providerUrl);
        EventBus.$emit(this.rowEvents.update, this.index, response.data);
        this.$toastr.s(this.$t('message.updated'));
      } catch (error) {
        console.error(error);
      } finally {
        this.submitting = false;
      }
    },
    async deleteProvider() {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        this.$t('admin.delete_workload_identity_provider_confirm'),
        {
          title: this.$t('admin.delete_workload_identity_provider'),
          okVariant: 'danger',
          okTitle: this.$t('message.delete'),
          cancelTitle: this.$t('message.cancel'),
          centered: true,
        },
      );
      if (!confirmed) return;
      try {
        await this.axios.delete(this.providerUrl);
        EventBus.$emit(this.rowEvents.delete, this.index);
        this.$toastr.s(this.$t('admin.workload_identity_provider_deleted'));
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>
