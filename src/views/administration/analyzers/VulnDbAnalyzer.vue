<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="scannerEnabled"
        color="primary"
        v-model="scannerEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.analyzer_vulndb_enable') }}
      <b-validated-input-group-form-input
        id="vulndb-consumer-key"
        :label="$t('admin.consumer_key')"
        input-group-size="mb-3"
        rules="required"
        type="email"
        v-model="consumerKey"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="vulndb-consumer-secret"
        :label="$t('admin.consumer_secret')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="consumerSecret"
        lazy="true"
      />
      <hr />
      {{ $t('admin.analyzer_vulndb_desc') }}
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
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import common from '@/shared/common';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import { BButton, BCard, BCardBody, BCardFooter } from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
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
      consumerKey: '',
      consumerSecret: '',
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
          case 'vulndb.enabled':
            this.scannerEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'vulndb.api.oauth1.consumerKey':
            this.consumerKey = item.propertyValue;
            break;
          case 'vulndb.api.oath1.consumerSecret':
            this.consumerSecret = item.propertyValue;
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
          propertyName: 'vulndb.enabled',
          propertyValue: this.scannerEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'vulndb.api.oauth1.consumerKey',
          propertyValue: this.consumerKey,
        },
        {
          groupName: 'scanner',
          propertyName: 'vulndb.api.oath1.consumerSecret',
          propertyValue: this.consumerSecret,
        },
      ]);
    },
  },
};
</script>
