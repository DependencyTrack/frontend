<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch id="scannerEnabled" color="primary" v-model="scannerEnabled" label v-bind="labelIcon" />{{$t('admin.analyzer_internal_enable')}}
      <!--
      <br/>
      <c-switch id="scannerCpeFuzzyEnableInput" color="primary" v-model="scannerCpeFuzzyEnableInput" label v-bind="labelIcon" />{{$t('admin.analyzer_internal_fuzzy_enable')}}
      <br/>
      <c-switch id="scannerCpeFuzzyExcludePurlInput" color="primary" v-model="scannerCpeFuzzyExcludePurlInput" label v-bind="labelIcon" />{{$t('admin.analyzer_internal_fuzzy_exclude_purl')}}
      -->
      <hr/>
      {{ $t('admin.analyzer_internal_desc') }}
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
        scannerCpeFuzzyEnableInput: false,
        scannerCpeFuzzyExcludePurlInput: false,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'scanner', propertyName: 'internal.enabled', propertyValue: this.scannerEnabled}
          // TODO: Future
          // {groupName: 'scanner', propertyName: 'internal.fuzzy.enabled', propertyValue: this.fuzzyEnabled}
          // {groupName: 'scanner', propertyName: 'internal.fuzzy.exclude.purl', propertyValue: this.fuzzyExcludePurl}
        ]);
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
              this.scannerCpeFuzzyExcludePurlInput = common.toBoolean(item.propertyValue); break;
          }
        }
      });
    }
  }
</script>
