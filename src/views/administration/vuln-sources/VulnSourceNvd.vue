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
      {{ $t('admin.vulnsource_nvd_desc') }}
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
      {{ $t('admin.nvd_enable_mirroring_via_api') }}
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <a :href="nvdApiWhyEnableUrl" target="_blank">{{ $t('admin.nvd_why_enable_api_help') }}</a>
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
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <a :href="nvdApiRequestApiKeyUrl" target="_blank">{{ $t('admin.nvd_request_api_key_help') }}</a>
      </p>
      <b-form-group :label="$t('admin.nvd_api_last_modification')">
        <b-input-group>
          <b-form-datepicker
            id="nvdApiLastModifiedDate"
            v-model="nvdApiLastModifiedDate"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
            :min="nvdApiLastModifiedDateMin"
            :max="nvdApiLastModifiedDateMax"
            locale="en-GB"
            :reset-button="true"
            :show-decade-nav="true"
          />
          <b-form-timepicker
            id="nvdApiLastModifiedTime"
            v-model="nvdApiLastModifiedTime"
            locale="en-GB"
            :reset-button="true"
          />
        </b-input-group>
      </b-form-group>
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        {{ $t('admin.nvd_api_last_modification_help') }}
      </p>
      <p class="font-sm text-muted">
        <span class="fa fa-warning">&nbsp;</span>
        {{ $t('admin.nvd_api_last_modification_warning') }}
      </p>
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
      nvdApiLastModifiedDate: '',
      nvdApiLastModifiedDateMin: new Date(1999, 1, 1),
      nvdApiLastModifiedDateMax: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      nvdApiLastModifiedTime: '',
      nvdApiWhyEnableUrl: 'https://nvd.nist.gov/General/News/change-timeline',
      nvdApiRequestApiKeyUrl: 'https://nvd.nist.gov/developers/request-an-api-key',
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
      if (!this.nvdApiLastModifiedDate) {
        return 0;
      } else if (!this.nvdApiLastModifiedTime) {
        let lastModifiedDateTime = Date.parse(this.nvdApiLastModifiedDate);
        return lastModifiedDateTime ? lastModifiedDateTime / 1000 : 0;
      }
      let lastModifiedDateTime = Date.parse(`${this.nvdApiLastModifiedDate}T${this.nvdApiLastModifiedTime}Z`);
      return lastModifiedDateTime ? lastModifiedDateTime / 1000 : 0;
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
