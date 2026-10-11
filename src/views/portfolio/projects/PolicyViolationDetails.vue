<template>
  <b-row class="expanded-row">
    <b-col sm="6">
      <div v-if="violation.policyCondition.subject === 'COORDINATES'">
        <b-form-group
          id="fieldset-1"
          :label="$t('message.group')"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            :value="violation.component.group"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
        <b-form-group
          id="fieldset-2"
          :label="$t('message.name')"
          label-for="input-2"
        >
          <b-form-input
            id="input-2"
            :value="violation.component.name"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
        <b-form-group
          id="fieldset-3"
          :label="$t('message.version')"
          label-for="input-3"
        >
          <b-form-input
            id="input-3"
            :value="violation.component.version"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
      </div>

      <div v-else-if="violation.policyCondition.subject === 'CPE'">
        <b-form-group
          v-if="violation.component.cpe"
          id="fieldset-1"
          :label="$t('message.cpe')"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            :value="violation.component.cpe"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
      </div>

      <div v-else-if="violation.policyCondition.subject === 'PACKAGE_URL'">
        <b-form-group
          v-if="violation.component.purl"
          id="fieldset-1"
          :label="$t('message.purl')"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            :value="violation.component.purl"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
      </div>

      <div v-else-if="violation.policyCondition.subject === 'SWID_TAGID'">
        <b-form-group
          v-if="violation.component.swid"
          id="fieldset-1"
          :label="$t('message.swid')"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            :value="violation.component.swid"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
      </div>

      <div
        v-else-if="
          violation.policyCondition.subject === 'LICENSE' ||
          violation.policyCondition.subject === 'LICENSE_GROUP'
        "
      >
        <b-form-group
          v-if="violation.component.resolvedLicense"
          id="fieldset-1"
          :label="$t('message.license')"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            :value="violation.component.resolvedLicense.licenseId"
            class="form-control disabled"
            readonly
            trim
          />
        </b-form-group>
      </div>

      <b-form-group
        id="failedCondition"
        :label="$t('message.condition')"
        label-for="failedCondition-input"
      >
        <b-form-textarea
          id="failedCondition-input"
          :value="conditionString"
          rows="3"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
    </b-col>
    <b-col sm="6">
      <b-form-group
        id="fieldset-7"
        :label="$t('message.audit_trail')"
        label-for="auditTrailField"
      >
        <b-form-textarea
          id="auditTrailField"
          :value="auditTrail"
          rows="7"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group
        id="fieldset-8"
        v-if="isPermitted(PERMISSIONS.POLICY_VIOLATION_ANALYSIS)"
        :label="$t('message.comment')"
        label-for="input-8"
      >
        <b-form-textarea
          id="input-8"
          v-model="comment"
          rows="4"
          class="form-control"
          trim
        />
        <div class="pull-right">
          <b-button size="sm" variant="outline-primary" @click="addComment"
            ><span class="fa fa-comment-o"></span
            >{{ $t('message.add_comment') }}</b-button
          >
        </div>
      </b-form-group>
      <b-form-group
        id="fieldset-9"
        v-if="isPermitted(PERMISSIONS.POLICY_VIOLATION_ANALYSIS)"
        :label="$t('message.analysis')"
        label-for="input-9"
      >
        <b-input-group id="input-9">
          <b-form-select
            v-model="analysisState"
            :options="analysisChoices"
            @change="makeAnalysis"
            style="flex: 0 1 auto; width: auto; margin-right: 2rem"
          />
          <b-form-checkbox
            v-model="isSuppressed"
            class="align-self-center"
            switch
            >{{ $t('message.suppressed') }}</b-form-checkbox
          >
        </b-input-group>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import common from '@/shared/common';
import permissionsMixin from '@/mixins/permissionsMixin';

export default {
  props: {
    violation: Object,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      auditTrail: null,
      comment: null,
      isSuppressed: null,
      analysisChoices: [
        { value: 'NOT_SET', text: this.$t('message.not_set') },
        { value: 'APPROVED', text: this.$t('message.approved') },
        { value: 'REJECTED', text: this.$t('message.rejected') },
      ],
      analysisState: null,
    };
  },
  computed: {
    conditionString: function () {
      return (
        'subject == ' +
        this.violation.policyCondition.subject +
        ' && value ' +
        this.violation.policyCondition.operator +
        ' ' +
        this.violation.policyCondition.value
      );
    },
  },
  watch: {
    isSuppressed: function (currentValue, oldValue) {
      if (oldValue != null) {
        this.callRestEndpoint(this.analysisState, null, currentValue);
      }
    },
  },
  methods: {
    getAnalysis: function () {
      let queryString =
        '?policyViolation=' +
        this.violation.uuid +
        '&component=' +
        this.violation.component.uuid;
      let url =
        `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION_ANALYSIS}` +
        queryString;
      this.axios.get(url).then((response) => {
        this.updateAnalysisData(response.data);
      });
    },
    updateAnalysisData: function (analysis) {
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisComments')) {
        let trail = '';
        for (let i = 0; i < analysis.analysisComments.length; i++) {
          if (
            Object.prototype.hasOwnProperty.call(
              analysis.analysisComments[i],
              'commenter',
            )
          ) {
            trail += analysis.analysisComments[i].commenter + ' - ';
          }
          trail += common.formatTimestamp(
            analysis.analysisComments[i].timestamp,
            true,
          );
          trail += '\n';
          trail += analysis.analysisComments[i].comment;
          trail += '\n\n';
        }
        this.auditTrail = trail;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'analysisState')) {
        this.analysisState = analysis.analysisState;
      }
      if (Object.prototype.hasOwnProperty.call(analysis, 'isSuppressed')) {
        this.isSuppressed = analysis.isSuppressed;
      } else {
        this.isSuppressed = false;
      }
    },
    makeAnalysis: function () {
      this.callRestEndpoint(this.analysisState, null, null);
    },
    addComment: function () {
      if (this.comment != null) {
        this.callRestEndpoint(this.analysisState, this.comment, null);
      }
    },
    callRestEndpoint: function (analysisState, comment, isSuppressed) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY_VIOLATION_ANALYSIS}`;
      this.axios
        .put(url, {
          policyViolation: this.violation.uuid,
          component: this.violation.component.uuid,
          analysisState: analysisState,
          comment: comment,
          isSuppressed: isSuppressed,
        })
        .then((response) => {
          this.$toastr.s(this.$t('message.updated'));
          this.updateAnalysisData(response.data);
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
  beforeMount() {
    this.getAnalysis();
  },
};
</script>
