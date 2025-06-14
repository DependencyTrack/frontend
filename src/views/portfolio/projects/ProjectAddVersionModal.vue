<template>
  <b-modal
    id="projectAddVersionModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.add_version')"
  >
    <b-row align-v="stretch">
      <b-col>
        <b-form-group
          id="fieldset-1"
          :label="this.$t('message.version')"
          label-for="input-1"
          label-class="required"
        >
          <b-form-input
            id="input-1"
            v-model="version"
            class="required"
            trim
            required
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
    <b-form-checkbox
      id="checkbox-1"
      v-model="includeTags"
      name="checkbox-1"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_tags') }}</b-form-checkbox
    >

    <b-form-checkbox
      id="checkbox-2"
      v-model="includeProperties"
      name="checkbox-2"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_properties') }}</b-form-checkbox
    >

    <b-form-checkbox
      id="checkbox-3"
      v-model="includeComponents"
      name="checkbox-3"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_components') }}</b-form-checkbox
    >

    <b-form-checkbox
      id="checkbox-4"
      v-model="includeServices"
      name="checkbox-4"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_services') }}</b-form-checkbox
    >

    <b-form-checkbox
      id="checkbox-5"
      v-model="includeAuditHistory"
      name="checkbox-5"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_audit_history') }}</b-form-checkbox
    >

    <b-form-checkbox
      id="checkbox-6"
      v-model="includeACL"
      name="checkbox-6"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_acl') }}</b-form-checkbox
    >

    <b-form-checkbox
      id="checkbox-7"
      v-model="includePolicyViolations"
      name="checkbox-7"
      switch
      value="true"
      unchecked-value="false"
    >
      {{ $t('message.include_policy_violations') }}</b-form-checkbox
    >

    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        :disabled="isSubmitButtonDisabled"
        @click="createVersion()"
        >{{ $t('message.create') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormSwitch from '@/forms/BInputGroupFormSwitch.vue';
import {
  BButton,
  BCol,
  BFormCheckbox,
  BFormGroup,
  BFormInput,
  BModal,
  BRow,
} from 'bootstrap-vue';

export default {
  components: {
    BInputGroupFormSwitch,
    BModal,
    BRow,
    BCol,
    BFormGroup,
    BFormInput,
    BFormCheckbox,
    BButton,
  },
  props: {
    uuid: String,
  },
  data() {
    return {
      version: null,
      includeTags: true,
      includeProperties: true,
      includeComponents: true,
      includeServices: true,
      includeAuditHistory: true,
      includeACL: true,
      includePolicyViolations: true,
      makeCloneLatest: false,
    };
  },
  computed: {
    isSubmitButtonDisabled() {
      const versionInputValue = this.version;
      if (versionInputValue) {
        /**
         * * ideally we would apply the check with the input value trimmed, however, since we are already using 'trim' prop on the input value.
         * * trimming the value here is not required.
         */
        return versionInputValue.length === 0;
      }

      return true;
    },
  },
  methods: {
    createVersion: function () {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/clone`;
      this.axios
        .put(url, {
          project: this.uuid,
          version: this.version,
          includeTags: this.includeTags,
          includeProperties: this.includeProperties,
          includeComponents: this.includeComponents,
          includeServices: this.includeServices,
          includeAuditHistory: this.includeAuditHistory,
          includeACL: this.includeACL,
          includePolicyViolations: this.includePolicyViolations,
          makeCloneLatest: this.makeCloneLatest,
        })
        .then((response) => {
          this.$root.$emit('bv::hide::modal', 'projectAddVersionModal');
          this.$toastr.s(this.$t('message.project_cloning_in_progress'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    resetValues: function () {
      this.version = null;
      this.includeTags = true;
      this.includeProperties = true;
      this.includeComponents = true;
      this.includeServices = true;
      this.includeAuditHistory = true;
      this.includeACL = true;
      this.includePolicyViolations = true;
      this.makeCloneLatest = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/vendors/vue-tags-input/vue-tags-input';
.custom-control {
  padding-bottom: 0.3rem;
}
</style>
