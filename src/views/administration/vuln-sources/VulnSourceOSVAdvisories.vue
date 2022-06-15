<template>
  <b-card no-body :header="header">
    <b-card-body>
      <hr/>
      <c-switch
        :disabled="!this.vulnsourceEnabled"
        color="primary"
        id="vulnsourceEnabled"
        label
        v-bind="labelIcon"
        v-model="vulnsourceEnabled"
      />
      {{$t('admin.vulnsource_osv_advisories_enable')}}
      <hr/>
      {{ $t('admin.vulnsource_osv_advisories_desc') }}
    </b-card-body>
    <b-card-footer>
      <b-button
        :disabled="this.vulnsourceEnabled"
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
import common from "../../../shared/common";
import configPropertyMixin from "../mixins/configPropertyMixin";

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String
  },
  components: {
    cSwitch
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
        {groupName: 'vuln-source', propertyName: 'google.osv.enabled', propertyValue: this.vulnsourceEnabled}
      ]);
    }
  },
  created () {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) { return item.groupName === "vuln-source" });
      for (let i=0; i<configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case "google.osv.enabled":
            this.vulnsourceEnabled = common.toBoolean(item.propertyValue); break;
        }
      }
    });
  }
}
</script>
