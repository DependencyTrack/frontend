<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch id="scannerEnabled" color="primary" v-model="scannerEnabled" label v-bind="labelIcon" />{{$t('admin.analyzer_npmaudit_enable')}}
      <hr/>
      {{ $t('admin.analyzer_npmaudit_desc') }}
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
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
        scannerEnabled: false,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'scanner', propertyName: 'npmaudit.enabled', propertyValue: this.scannerEnabled}
        ]);
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "scanner" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "npmaudit.enabled":
              this.scannerEnabled = common.toBoolean(item.propertyValue); break;
          }
        }
      });
    }
  }
</script>
