<template>
  <b-modal
    id="bulkUpdateModal"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.bulk_update')"
    @hide="resetValues"
  >
    <div v-if="selectedProjects.length">
      <p>
        <strong>{{ selectedProjects.length }}</strong>
        {{ $t('message.projects_selected') }}
      </p>
    </div>
    <div v-else>
      <p>{{ $t('message.no_projects_selected') }}</p>
    </div>

    <b-form-group
      :label="$t('message.comment')"
      label-for="comment-field"
      class="mt-3"
    >
      <b-form-textarea id="comment-field" v-model="comment" rows="4" trim />
    </b-form-group>

    <b-form-group :label="$t('message.analysis')" label-for="analysis-select">
      <b-form-select
        id="analysis-select"
        v-model="analysisState"
        :options="analysisChoices"
        v-b-tooltip.hover
        :title="$t('message.analysis_tooltip')"
      />
    </b-form-group>

    <b-form-group
      :label="$t('message.justification')"
      label-for="justification-select"
    >
      <b-form-select
        id="justification-select"
        v-model="analysisJustification"
        :options="justificationChoices"
        :disabled="analysisState !== 'NOT_AFFECTED'"
        v-b-tooltip.hover
        :title="$t('message.justification_tooltip')"
      />
    </b-form-group>

    <b-form-group
      id="fieldset-11"
      :label="this.$t('message.response')"
      label-for="input-11"
    >
      <b-input-group id="input-11">
        <b-form-select
          v-model="analysisResponse"
          :options="responseChoices"
          :disabled="analysisState === null"
          v-b-tooltip.hover
          :title="this.$t('message.response_tooltip')"
        />
      </b-input-group>
    </b-form-group>

    <b-form-group
      v-if="this.isPermitted(this.PERMISSIONS.VIEW_VULNERABILITY)"
      :label="$t('message.details')"
      label-for="analysisDetailsField"
    >
      <b-form-textarea
        id="analysisDetailsField"
        v-model="analysisDetails"
        rows="4"
        class="form-control"
        :disabled="
            analysisState === null ||
            !this.isPermitted(this.PERMISSIONS.VULNERABILITY_ANALYSIS)
          "
        v-b-tooltip.hover
        :title="this.$t('message.analysis_details_tooltip')"
      />
    </b-form-group>

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">
        {{ $t('message.close') }}
      </b-button>
      <b-button
        size="md"
        variant="primary"
        :disabled="!analysisState"
        @click="submit"
      >
        {{ $t('message.apply') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
export default {
  name: 'BulkUpdateModal',
  props: {
    selectedProjects: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      comment: '',
      analysisState: null,
      analysisJustification: null,
      analysisResponse: null,
      analysisDetails: '',
      isSuppressed: !!this.finding?.analysis?.isSuppressed,
      analysisChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        { value: 'EXPLOITABLE', text: this.$t('message.exploitable') },
        { value: 'IN_TRIAGE', text: this.$t('message.in_triage') },
        { value: 'RESOLVED', text: this.$t('message.resolved') },
        { value: 'FALSE_POSITIVE', text: this.$t('message.false_positive') },
        { value: 'NOT_AFFECTED', text: this.$t('message.not_affected') },
      ],
      justificationChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        {
          value: 'CODE_NOT_PRESENT',
          text: this.$t('message.code_not_present'),
        },
        {
          value: 'CODE_NOT_REACHABLE',
          text: this.$t('message.code_not_reachable'),
        },
        {
          value: 'REQUIRES_CONFIGURATION',
          text: this.$t('message.requires_configuration'),
        },
        {
          value: 'REQUIRES_DEPENDENCY',
          text: this.$t('message.requires_dependency'),
        },
        {
          value: 'REQUIRES_ENVIRONMENT',
          text: this.$t('message.requires_environment'),
        },
        {
          value: 'PROTECTED_BY_COMPILER',
          text: this.$t('message.protected_by_compiler'),
        },
        {
          value: 'PROTECTED_AT_RUNTIME',
          text: this.$t('message.protected_at_runtime'),
        },
        {
          value: 'PROTECTED_AT_PERIMETER',
          text: this.$t('message.protected_at_perimeter'),
        },
        {
          value: 'PROTECTED_BY_MITIGATING_CONTROL',
          text: this.$t('message.protected_by_mitigating_control'),
        },
      ],
      responseChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        { value: 'CAN_NOT_FIX', text: this.$t('message.can_not_fix') },
        { value: 'WILL_NOT_FIX', text: this.$t('message.will_not_fix') },
        { value: 'UPDATE', text: this.$t('message.update') },
        { value: 'ROLLBACK', text: this.$t('message.rollback') },
        {
          value: 'WORKAROUND_AVAILABLE',
          text: this.$t('message.workaround_available'),
        },
      ],
    };
  },
  mixins: [permissionsMixin],
  methods: {
    resetValues() {
      this.comment = '';
      this.analysisState = null;
      this.analysisJustification = null;
      this.analysisResponse = null;
      this.analysisDetails = '';
      this.isSuppressed = !!this.finding?.analysis?.isSuppressed;
    },
    submit() {
      this.$emit('submit-bulk-analysis', {
        selectedProjects: this.selectedProjects,
        comment: this.comment,
        analysisState: this.analysisState,
        analysisJustification: this.analysisJustification,
        analysisResponse: this.analysisResponse,
        analysisDetails: this.analysisDetails,
        isSuppressed: this.isSuppressed,
      });
    },
  },
};
</script>

<style scoped>
ul {
  padding-left: 1.2rem;
}
</style>
