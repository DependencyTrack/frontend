<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="scannerEnabled"
        color="primary"
        v-model="scannerEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_enable') }}
      <br />
      <c-switch
        id="scannerCpeFuzzyEnableInput"
        color="primary"
        v-model="scannerCpeFuzzyEnableInput"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_fuzzy_enable') }}
      <br />
      <c-switch
        id="scannerCpeFuzzyExcludePurlInput"
        color="primary"
        v-model="scannerCpeFuzzyExcludePurlInput"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_fuzzy_exclude_purl') }}
      <br />
      <c-switch
        id="scannerCpeFuzzyExcludeInternalInput"
        color="primary"
        v-model="scannerCpeFuzzyExcludeInternalInput"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_internal_fuzzy_exclude_internal') }}
      <hr />
      {{ $t('admin.analyzer_internal_desc') }}
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import common from '@/shared/common';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import { BButton, BCard, BCardBody, BCardFooter } from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BCard,
    BCardBody,
    BCardFooter,
    BButton,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {
      scannerEnabled: false,
      scannerCpeFuzzyEnableInput: false,
      scannerCpeFuzzyExcludePurlInput: true,
      scannerCpeFuzzyExcludeInternalInput: true,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'scanner';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'internal.enabled':
            this.scannerEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'internal.fuzzy.enabled':
            this.scannerCpeFuzzyEnableInput = common.toBoolean(
              item.propertyValue,
            );
            break;
          case 'internal.fuzzy.exclude.purl':
            this.scannerCpeFuzzyExcludePurlInput = !common.toBoolean(
              item.propertyValue,
            );
            break;
          case 'internal.fuzzy.exclude.internal':
            this.scannerCpeFuzzyExcludeInternalInput = !common.toBoolean(
              item.propertyValue,
            );
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'scanner',
          propertyName: 'internal.enabled',
          propertyValue: this.scannerEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.fuzzy.enabled',
          propertyValue: this.scannerCpeFuzzyEnableInput,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.fuzzy.exclude.purl',
          propertyValue:
            !this.scannerCpeFuzzyEnableInput ||
            !this.scannerCpeFuzzyExcludePurlInput,
        },
        {
          groupName: 'scanner',
          propertyName: 'internal.fuzzy.exclude.internal',
          propertyValue:
            !this.scannerCpeFuzzyEnableInput ||
            !this.scannerCpeFuzzyExcludeInternalInput,
        },
      ]);
      if (!this.scannerCpeFuzzyEnableInput) {
        this.scannerCpeFuzzyExcludePurlInput = false;
        this.scannerCpeFuzzyExcludeInternalInput = false;
      }
    },
  },
};
</script>
