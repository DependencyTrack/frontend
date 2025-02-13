<template>
  <b-card no-body :header="this.$t('admin.telemetry')">
    <b-card-body>
      <b-form-group
        :label="this.$t('admin.preferences')"
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-2"
      >
        <c-switch
          id="submission-enabled"
          color="primary"
          v-model="isSubmissionEnabled"
          label
          v-bind="labelIcon"
        />{{ this.$t('admin.enable_telemetry_submission') }}
      </b-form-group>
      <b-form-group
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-2"
        :label="this.$t('admin.telemetry_last_submission')"
        :description="lastSubmissionDataDescription"
        label-for="last-submission-data"
      >
        <b-form-textarea
          id="last-submission-data"
          :value="lastSubmissionDataString"
          rows="3"
          max-rows="6"
          readonly
        ></b-form-textarea>
      </b-form-group>
    </b-card-body>
    <b-card-footer>
      <b-button
        size="md"
        class="px-4"
        variant="outline-primary"
        @click="saveChanges"
        >{{ $t('message.update') }}</b-button
      >
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
import configPropertyMixin from '../mixins/configPropertyMixin';
import common from '../../../shared/common';

export default {
  computed: {
    common() {
      return common;
    },
    lastSubmissionDataString() {
      return this.lastSubmissionData
        ? JSON.stringify(this.lastSubmissionData, null, 2)
        : this.$t('admin.telemetry_no_data_submitted_yet');
    },
    lastSubmissionDataDescription() {
      return this.lastSubmissionEpochSeconds
        ? this.$t('admin.telemetry_submitted_at', {
            timestamp: common.formatTimestamp(
              this.lastSubmissionEpochSeconds,
              true,
            ),
          })
        : '';
    },
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
  },
  data() {
    return {
      isSubmissionEnabled: null,
      lastSubmissionEpochSeconds: null,
      lastSubmissionData: null,
    };
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'telemetry',
          propertyName: 'submission.enabled',
          propertyValue: this.isSubmissionEnabled,
        },
      ]);
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'telemetry';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'submission.enabled':
            this.isSubmissionEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'last.submission.epoch.seconds':
            this.lastSubmissionEpochSeconds = item.propertyValue
              ? parseInt(item.propertyValue) * 1000
              : null;
            break;
          case 'last.submission.data':
            this.lastSubmissionData = item.propertyValue
              ? JSON.parse(item.propertyValue)
              : null;
            break;
        }
      }
    });
  },
};
</script>
