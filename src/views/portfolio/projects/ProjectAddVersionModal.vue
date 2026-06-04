<template>
  <b-modal
    id="projectAddVersionModal"
    @shown="focusVersionInput"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :no-close-on-backdrop="isCloning"
    :no-close-on-esc="isCloning"
    :title="$t('message.add_version')"
  >
    <b-form id="addVersionForm" @submit.prevent="createVersion">
      <b-row align-v="stretch">
        <b-col>
          <b-form-group
            id="fieldset-1"
            :label="this.$t('message.version')"
            label-for="input-1"
            label-class="required"
            :invalid-feedback="versionInvalidFeedback"
            :state="versionInvalidFeedback ? false : null"
          >
            <b-form-input
              id="input-1"
              ref="versionInput"
              v-model="version"
              class="required"
              trim
              required
              :state="versionInvalidFeedback ? false : null"
              @input="versionInvalidFeedback = null"
            />
          </b-form-group>
        </b-col>
        <b-col cols="auto">
          <b-input-group-form-switch
            id="project-details-islatest"
            :label="$t('message.project_is_latest')"
            v-model="makeCloneLatest"
            :show-placeholder-label="true"
          />
        </b-col>
      </b-row>

      <p class="text-muted mb-2">
        {{ $t('message.add_version_includes_help') }}
      </p>

      <b-form-checkbox id="checkbox-tags" v-model="includeTags" switch>
        {{ $t('message.include_tags') }}
      </b-form-checkbox>

      <b-form-checkbox
        id="checkbox-properties"
        v-model="includeProperties"
        switch
      >
        {{ $t('message.include_properties') }}
      </b-form-checkbox>

      <b-form-checkbox id="checkbox-services" v-model="includeServices" switch>
        {{ $t('message.include_services') }}
      </b-form-checkbox>

      <b-form-checkbox id="checkbox-acl" v-model="includeACL" switch>
        {{ $t('message.include_acl') }}
      </b-form-checkbox>

      <b-form-checkbox
        id="checkbox-components"
        v-model="includeComponents"
        switch
      >
        {{ $t('message.include_components') }}
      </b-form-checkbox>

      <b-form-checkbox id="checkbox-findings" v-model="includeFindings" switch>
        {{ $t('message.include_findings') }}
      </b-form-checkbox>

      <b-form-checkbox
        id="checkbox-findings-audit-history"
        v-model="includeFindingsAuditHistory"
        switch
      >
        {{ $t('message.include_findings_audit_history') }}
      </b-form-checkbox>

      <b-form-checkbox
        id="checkbox-policy-violations"
        v-model="includePolicyViolations"
        switch
      >
        {{ $t('message.include_policy_violations') }}
      </b-form-checkbox>

      <b-form-checkbox
        id="checkbox-policy-violations-audit-history"
        v-model="includePolicyViolationsAuditHistory"
        switch
      >
        {{ $t('message.include_policy_violations_audit_history') }}
      </b-form-checkbox>
    </b-form>

    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="secondary"
        :disabled="isCloning"
        @click="cancel()"
        >{{ $t('message.cancel') }}</b-button
      >
      <b-button
        type="submit"
        form="addVersionForm"
        size="md"
        variant="primary"
        :disabled="isSubmitButtonDisabled || isCloning"
      >
        <b-spinner v-if="isCloning" small class="mr-1"></b-spinner>
        {{ $t('message.create') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormSwitch from '@/forms/BInputGroupFormSwitch.vue';

export default {
  name: 'ProjectAddVersionModal',
  components: { BInputGroupFormSwitch },
  props: {
    uuid: String,
  },
  data() {
    return {
      version: null,
      versionInvalidFeedback: null,
      makeCloneLatest: false,
      includeTags: true,
      includeProperties: true,
      includeServices: true,
      includeACL: true,
      includeComponents: true,
      includeFindings: true,
      includeFindingsAuditHistory: true,
      includePolicyViolations: true,
      includePolicyViolationsAuditHistory: true,
      isCloning: false,
    };
  },
  computed: {
    isSubmitButtonDisabled() {
      // The input uses the 'trim' prop, so the bound value is already trimmed.
      return !this.version || this.version.length === 0;
    },
  },
  watch: {
    includeComponents(value) {
      if (!value) {
        this.includeFindings = false;
        this.includePolicyViolations = false;
      }
    },
    includeFindings(value) {
      if (value) {
        this.includeComponents = true;
      } else {
        this.includeFindingsAuditHistory = false;
      }
    },
    includeFindingsAuditHistory(value) {
      if (value) {
        this.includeFindings = true;
      }
    },
    includePolicyViolations(value) {
      if (value) {
        this.includeComponents = true;
      } else {
        this.includePolicyViolationsAuditHistory = false;
      }
    },
    includePolicyViolationsAuditHistory(value) {
      if (value) {
        this.includePolicyViolations = true;
      }
    },
  },
  methods: {
    focusVersionInput: function () {
      this.$refs.versionInput?.focus();
    },
    createVersion: function () {
      if (this.isSubmitButtonDisabled || this.isCloning) {
        return;
      }
      const includes = [];
      if (this.includeTags) includes.push('TAGS');
      if (this.includeProperties) includes.push('PROPERTIES');
      if (this.includeServices) includes.push('SERVICES');
      if (this.includeACL) includes.push('ACL');
      if (this.includeComponents) includes.push('COMPONENTS');
      if (this.includeFindings) includes.push('FINDINGS');
      if (this.includeFindingsAuditHistory)
        includes.push('FINDINGS_AUDIT_HISTORY');
      if (this.includePolicyViolations) includes.push('POLICY_VIOLATIONS');
      if (this.includePolicyViolationsAuditHistory)
        includes.push('POLICY_VIOLATIONS_AUDIT_HISTORY');
      let url = `${this.$api.BASE_URL}/api/v2/projects/${this.uuid}/clone`;
      this.isCloning = true;
      this.axios
        .post(url, {
          version: this.version,
          version_is_latest: this.makeCloneLatest === true,
          includes: includes,
        })
        .then((response) => {
          this.$root.$emit('bv::hide::modal', 'projectAddVersionModal');
          this.$toastr.s(this.$t('message.project_created'));
          this.$router.push({
            name: 'Project',
            params: { uuid: response.data.uuid },
          });
        })
        .catch((error) => {
          if (error.response && error.response.status === 409) {
            this.versionInvalidFeedback = this.$t(
              'message.project_version_conflict',
              { version: this.version },
            );
          } else {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          }
        })
        .finally(() => {
          this.isCloning = false;
        });
    },
    resetValues: function () {
      this.version = null;
      this.versionInvalidFeedback = null;
      this.makeCloneLatest = false;
      this.includeTags = true;
      this.includeProperties = true;
      this.includeServices = true;
      this.includeACL = true;
      this.includeComponents = true;
      this.includeFindings = true;
      this.includeFindingsAuditHistory = true;
      this.includePolicyViolations = true;
      this.includePolicyViolationsAuditHistory = true;
      this.isCloning = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/vendors/vue-tags-input/vue-tags-input';
.custom-control {
  padding-bottom: 0.3rem;
}
</style>
