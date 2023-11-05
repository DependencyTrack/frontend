<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        :disabled="!this.vulnsourceEnabled && !this.nvdFeedsUrl"
        id="vulnsourceEnabled"
        color="primary"
        v-model="vulnsourceEnabled"
        label
        v-bind="labelIcon"
      />
      {{$t('admin.vulnsource_nvd_enable')}}
      <hr/>
      <b-validated-input-group-form-input
        id="nvd-feeds-url"
        :label="$t('admin.vulnsource_nvd_feeds_url')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="nvdFeedsUrl"
        lazy="true"
      />
      <hr/>
      <c-switch
        id="nvdApiEnabled"
        color="primary"
        v-model="nvdApiEnabled"
        label
        v-bind="labelIcon"
      />
      Enable API
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <!-- TODO: Explain why users may want to enable API over feeds; Point out caveats (feed files no longer being downloaded etc.) -->
        Foobarbaz
      </p>
      <b-validated-input-group-form-input
        id="nvdApiEndpoint"
        label="API endpoint"
        input-group-size="mb-3"
        v-model="nvdApiEndpoint"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="nvdApiKey"
        label="API key"
        input-group-size="mb-3"
        type="password"
        v-model="nvdApiKey"
        lazy="true"
      />
      <b-form-group label="Last Modification">
        <b-input-group>
          <b-form-datepicker
            id="nvdApiLastModifiedDate"
            v-model="nvdApiLastModifiedDate"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
            locale="en-GB"
          />
          <b-form-timepicker
            id="nvdApiLastModifiedTime"
            v-model="nvdApiLastModifiedTime"
            locale="en-GB"
          />
        </b-input-group>
      </b-form-group>
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <!-- TODO: Explain what the last modified datetime is used for and when users may want to modify it. -->
        Foobarbaz
      </p>
      <hr/>
      {{ $t('admin.vulnsource_nvd_desc') }}
    </b-card-body>
    <b-card-footer>
      <b-button
        :disabled="this.vulnsourceEnabled && !this.nvdFeedsUrl"
        variant="outline-primary"
        class="px-4"
        @click="saveChanges">
          {{ $t('message.update') }}
      </b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
import BInputGroupFormDatepicker from "../../../forms/BInputGroupFormDatepicker";
import common from "../../../shared/common";
import configPropertyMixin from "../mixins/configPropertyMixin";

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String
  },
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
    BInputGroupFormDatepicker
  },
  data() {
    return {
      vulnsourceEnabled: false,
      nvdFeedsUrl: '',
      nvdApiEnabled: false,
      nvdApiEndpoint: '',
      nvdApiKey: '',
      nvdApiLastModifiedDate: new Date().toISOString(),
      nvdApiLastModifiedTime: '',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
    }
  },
  methods: {
    saveChanges: function() {
      this.updateConfigProperties([
        {groupName: 'vuln-source', propertyName: 'nvd.enabled', propertyValue: this.vulnsourceEnabled},
        {groupName: 'vuln-source', propertyName: 'nvd.feeds.url', propertyValue: this.nvdFeedsUrl},
        {groupName: 'vuln-source', propertyName: 'nvd.api.enabled', propertyValue: this.nvdApiEnabled},
        {groupName: 'vuln-source', propertyName: 'nvd.api.url', propertyValue: this.nvdApiEndpoint},
        {groupName: 'vuln-source', propertyName: 'nvd.api.key', propertyValue: this.nvdApiKey},
        {groupName: 'vuln-source', propertyName: 'nvd.api.last.modified.epoch.seconds', propertyValue: this.getApiLastModifiedEpochSeconds()}
      ]);
    },
    getApiLastModifiedEpochSeconds() {
      let lastModifiedDateTime = Date.parse(`${this.nvdApiLastModifiedDate}T${this.nvdApiLastModifiedTime}Z`);
      return lastModifiedDateTime ? lastModifiedDateTime / 1000 : null;
    }
  },
  created () {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) { return item.groupName === "vuln-source" });
      for (let i=0; i<configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case "nvd.enabled":
            this.vulnsourceEnabled = common.toBoolean(item.propertyValue); break;
          case "nvd.feeds.url":
            this.nvdFeedsUrl = item.propertyValue; break;
          case "nvd.api.enabled":
            this.nvdApiEnabled = common.toBoolean(item.propertyValue); break;
          case "nvd.api.url":
            this.nvdApiEndpoint = item.propertyValue; break;
          case "nvd.api.key":
            this.nvdApiKey = item.propertyValue; break;
          case "nvd.api.last.modified.epoch.seconds":
            let epochSeconds = parseInt(item.propertyValue);
            if (!epochSeconds) {
              continue;
            }
            let date = new Date(0);
            date.setUTCSeconds(epochSeconds);
            this.nvdApiLastModifiedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
            this.nvdApiLastModifiedTime = date.toLocaleTimeString("en-GB"); // HH:mm:SS
            break;
        }
      }
    });
  }
}
</script>
