<template>
  <b-card no-body :header="header">
    <b-card-body>
      <img alt="GitHub logo" src="@/assets/img/github-logo.svg" width="65"/>
      <hr/>
      <c-switch
        :disabled="!this.vulnsourceEnabled && !this.apitoken"
        color="primary"
        id="vulnsourceEnabled"
        label
        v-bind="labelIcon"
        v-model="vulnsourceEnabled"
      />
      {{$t('admin.vulnsource_github_advisories_enable')}}
      <b-validated-input-group-form-input
        id="github-advisories-apitoken"
        :label="$t('admin.personal_access_token')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="apitoken"
        lazy="true"
      />
      <hr/>
      {{ $t('admin.vulnsource_github_advisories_desc') }}
    </b-card-body>
    <b-card-footer>
      <b-button
        :disabled="this.vulnsourceEnabled && !this.apitoken"
        @click="saveChanges"
        class="px-4"
        variant="outline-primary">
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
      apitoken: '',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
    }
  },
  methods: {
    saveChanges: function() {
      this.updateConfigProperties([
        {groupName: 'vuln-source', propertyName: 'github.advisories.enabled', propertyValue: this.vulnsourceEnabled},
        {groupName: 'vuln-source', propertyName: 'github.advisories.access.token', propertyValue: this.apitoken}
      ]);
    }
  },
  created () {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) { return item.groupName === "vuln-source" });
      for (let i=0; i<configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case "github.advisories.enabled":
            this.vulnsourceEnabled = common.toBoolean(item.propertyValue); break;
          case "github.advisories.access.token":
            this.apitoken = item.propertyValue; break;
        }
      }
    });
  }
}
</script>
