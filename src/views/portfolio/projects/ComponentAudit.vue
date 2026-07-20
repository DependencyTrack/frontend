<template>
  <b-row class="expanded-row">
    <b-col sm="6">
      <b-form-group label="Uploaded license" label-for="uploaded-license">
        <b-form-input
          id="uploaded-license"
          :value="uploadedLicense"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group
        v-if="component.description"
        :label="this.$t('message.description')"
        label-for="component-description"
      >
        <b-form-textarea
          id="component-description"
          :value="component.description"
          rows="7"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group
        v-if="component.purl"
        label="Package URL"
        label-for="component-purl"
      >
        <b-form-input
          id="component-purl"
          :value="component.purl"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
    </b-col>
    <b-col sm="6">
      <b-form-group label="Audit Trail" label-for="audit-trail">
        <b-form-textarea
          id="audit-trail"
          v-model="auditTrail"
          rows="7"
          class="form-control disabled"
          readonly
          trim
        />
      </b-form-group>
      <b-form-group label="Comment" label-for="audit-comment">
        <b-form-textarea
          id="audit-comment"
          v-model="comment"
          rows="3"
          class="form-control"
          :disabled="!analysisId || !canEdit"
          trim
        />
        <div class="pull-right">
          <b-button
            size="sm"
            variant="outline-primary"
            :disabled="!analysisId || !comment || !canEdit"
            @click="addComment"
            ><span class="fa fa-comment-o"></span>
            {{ this.$t('message.add_comment') }}</b-button
          >
        </div>
      </b-form-group>
      <b-form-group label="License override" label-for="override-license">
        <b-form-select
          id="override-license"
          v-model="overrideLicense"
          :options="selectableLicenses"
          :disabled="!canEdit"
        />
      </b-form-group>
      <b-form-group label="Details" label-for="override-details">
        <b-form-textarea
          id="override-details"
          v-model="details"
          rows="3"
          class="form-control"
          :disabled="!canEdit"
          placeholder="Why this license override is correct (visible on the component)"
          trim
        />
        <div class="pull-right">
          <b-button
            size="sm"
            variant="outline-primary"
            :disabled="!canEdit"
            @click="upsertAnalysis"
            ><span class="fa fa-comment-o"></span>
            {{ this.$t('message.update_details') }}</b-button
          >
        </div>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script>
import common from '@/shared/common';
import permissionsMixin from '@/mixins/permissionsMixin';

export default {
  props: {
    component: Object,
    projectUuid: String,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      selectableLicenses: [],
      initialized: false,
      analysisId: null,
      declaredLicense: null,
      auditTrail: null,
      comment: null,
      overrideLicense: null,
      details: null,
    };
  },
  computed: {
    canEdit: function () {
      return this.isPermitted(this.PERMISSIONS.POLICY_MANAGEMENT);
    },
    uploadedLicense: function () {
      // with an override stored, the snapshot holds the uploaded value;
      // without one, the component itself still carries it
      if (this.declaredLicense) {
        return this.declaredLicense;
      }
      if (this.analysisId && this.overrideLicense) {
        return '(none)';
      }
      if (this.component.resolvedLicense) {
        return (
          this.component.resolvedLicense.licenseId ||
          this.component.resolvedLicense.name
        );
      }
      return (
        this.component.license || this.component.licenseExpression || '(none)'
      );
    },
  },
  created() {
    this.retrieveLicenses();
    this.loadAnalysis();
  },
  watch: {
    overrideLicense: function () {
      if (this.initialized) {
        this.upsertAnalysis();
      }
    },
  },
  methods: {
    retrieveLicenses: function () {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}`;
      this.axios.get(url).then((response) => {
        // Empty option = no override; custom licenses have no licenseId,
        // their name doubles as the identifier.
        const licenses = [{ value: '', text: '' }];
        for (const license of response.data) {
          licenses.push({
            value: license.licenseId || license.name,
            text: license.name,
          });
        }
        this.selectableLicenses = licenses;
      });
    },
    identityMatches: function (analysis) {
      const norm = (value) => value || '';
      return (
        norm(analysis.purl) === norm(this.component.purl) &&
        norm(analysis.group) === norm(this.component.group) &&
        norm(analysis.name) === norm(this.component.name) &&
        norm(analysis.version) === norm(this.component.version)
      );
    },
    loadAnalysis: function () {
      const url = `${this.$api.BASE_URL}/api/v2/component-analyses?project=${this.projectUuid}`;
      this.axios.get(url).then((response) => {
        const analysis = (response.data.analyses || []).find(
          this.identityMatches,
        );
        if (analysis) {
          this.analysisId = analysis.id;
          this.overrideLicense = analysis.license;
          this.declaredLicense = analysis.declaredLicense;
          this.details = analysis.details;
          this.loadComments();
        }
        // saves triggered by user edits only, not by this initial load
        this.$nextTick(() => {
          this.initialized = true;
        });
      });
    },
    loadComments: function () {
      if (!this.analysisId) {
        return;
      }
      const url = `${this.$api.BASE_URL}/api/v2/component-analyses/${this.analysisId}/comments`;
      this.axios.get(url).then((response) => {
        let trail = '';
        for (const comment of response.data.comments || []) {
          if (comment.commenter) {
            trail += comment.commenter + ' - ';
          }
          // v2 serializes timestamps as epoch seconds
          trail += common.formatTimestamp(comment.timestamp * 1000, true);
          trail += '\n' + comment.comment + '\n\n';
        }
        this.auditTrail = trail;
      });
    },
    upsertAnalysis: function () {
      const url = `${this.$api.BASE_URL}/api/v2/component-analyses`;
      this.axios
        .put(url, {
          projectUuid: this.projectUuid,
          purl: this.component.purl || null,
          group: this.component.group || null,
          name: this.component.name,
          version: this.component.version || null,
          license: this.overrideLicense || null,
          details: this.details || null,
        })
        .then((response) => {
          this.analysisId = response.data.id;
          this.$toastr.s(this.$t('message.updated'));
          this.loadComments();
        })
        .catch((error) => {
          this.$toastr.w(
            error.response && error.response.status === 400
              ? 'Unknown license — create it as a custom license first'
              : this.$t('condition.unsuccessful_action'),
          );
        });
    },
    addComment: function () {
      if (!this.analysisId || !this.comment) {
        return;
      }
      const url = `${this.$api.BASE_URL}/api/v2/component-analyses/${this.analysisId}/comments`;
      this.axios.post(url, { comment: this.comment }).then(() => {
        this.comment = null;
        this.loadComments();
      });
    },
  },
};
</script>
