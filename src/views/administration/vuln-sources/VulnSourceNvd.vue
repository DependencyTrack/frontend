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
import common from "../../../shared/common";
import configPropertyMixin from "../mixins/configPropertyMixin";

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String
  },
  components: {
    cSwitch,
    BValidatedInputGroupFormInput
  },
  data() {
    return {
      vulnsourceEnabled: false,
      nvdFeedsUrl: '',
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
        {groupName: 'vuln-source', propertyName: 'nvd.feeds.url', propertyValue: this.nvdFeedsUrl}
      ]);
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
        }
      }
    });
  }
}
</script>
