<template>
  <b-card no-body :header="header">
    <b-card-body>
      <CSwitch id="scannerEnabled" color="primary" :checked.sync="scannerEnabled" label />{{$t('admin.analyzer_internal_enable')}}
      <br/>
      <CSwitch id="scannerCpeFuzzyEnableInput" color="primary" :checked.sync="scannerCpeFuzzyEnableInput" label />{{$t('admin.analyzer_internal_fuzzy_enable')}}
      <br/>
      <CSwitch id="scannerCpeFuzzyExcludePurlInput" color="primary" :checked.sync="scannerCpeFuzzyExcludePurlInput" label />{{$t('admin.analyzer_internal_fuzzy_exclude_purl')}}
      <br/>
      <CSwitch id="scannerCpeFuzzyExcludeInternalInput" color="primary" :checked.sync="scannerCpeFuzzyExcludeInternalInput" label />{{$t('admin.analyzer_internal_fuzzy_exclude_internal')}}
      <hr/>
      {{ $t('admin.analyzer_internal_desc') }}
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  import { CSwitch } from '@coreui/vue';
  import common from "../../../shared/common";
  import configPropertyMixin from "../mixins/configPropertyMixin";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      CSwitch
    },
    data() {
      return {
        scannerEnabled: false,
        scannerCpeFuzzyEnableInput: false,
        scannerCpeFuzzyExcludePurlInput: true,
        scannerCpeFuzzyExcludeInternalInput: true,
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'scanner', propertyName: 'internal.enabled', propertyValue: this.scannerEnabled},
          {groupName: 'scanner', propertyName: 'internal.fuzzy.enabled', propertyValue: this.scannerCpeFuzzyEnableInput},
          {groupName: 'scanner', propertyName: 'internal.fuzzy.exclude.purl', propertyValue: !this.scannerCpeFuzzyEnableInput || !this.scannerCpeFuzzyExcludePurlInput},
          {groupName: 'scanner', propertyName: 'internal.fuzzy.exclude.internal', propertyValue: !this.scannerCpeFuzzyEnableInput || !this.scannerCpeFuzzyExcludeInternalInput}
        ]);
        if (!this.scannerCpeFuzzyEnableInput){
          this.scannerCpeFuzzyExcludePurlInput = false;
          this.scannerCpeFuzzyExcludeInternalInput = false;
        }
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "scanner" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "internal.enabled":
              this.scannerEnabled = common.toBoolean(item.propertyValue); break;
            case "internal.fuzzy.enabled":
              this.scannerCpeFuzzyEnableInput = common.toBoolean(item.propertyValue); break;
            case "internal.fuzzy.exclude.purl":
              this.scannerCpeFuzzyExcludePurlInput = !common.toBoolean(item.propertyValue); break;
            case "internal.fuzzy.exclude.internal":
              this.scannerCpeFuzzyExcludeInternalInput = !common.toBoolean(item.propertyValue); break;
          }
        }
      });
    }
  }
</script>
