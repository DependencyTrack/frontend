<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="scannerEnabled"
        color="primary"
        v-model="scannerEnabled"
        label
        v-bind="labelIcon"
      />
      {{ $t('admin.analyzer_ossindex_enable') }}
      <br />
      <c-switch
        :disabled="!this.scannerEnabled"
        id="aliasSyncEnabled"
        color="primary"
        v-model="aliasSyncEnabled"
        label
        v-bind="labelIcon"
        :title="$t('admin.vulnsource_alias_sync_enable_tooltip')"
      />
      {{ $t('admin.vulnsource_alias_sync_enable') }}
      <b-validated-input-group-form-input
        id="ossindex-username"
        :label="$t('admin.registered_email_address')"
        input-group-size="mb-3"
        rules="required"
        type="email"
        v-model="username"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="ossindex-apitoken"
        :label="$t('admin.api_token')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="apitoken"
        lazy="true"
      />
      <hr />
      {{ $t('admin.analyzer_ossindex_desc') }}
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
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
import common from '../../../shared/common';
import configPropertyMixin from '../mixins/configPropertyMixin';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
  },
  data() {
    return {
      scannerEnabled: false,
      aliasSyncEnabled: false,
      username: '',
      apitoken: '',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'scanner',
          propertyName: 'ossindex.enabled',
          propertyValue: this.scannerEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'ossindex.alias.sync.enabled',
          propertyValue: this.aliasSyncEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'ossindex.api.username',
          propertyValue: this.username,
        },
        {
          groupName: 'scanner',
          propertyName: 'ossindex.api.token',
          propertyValue: this.apitoken,
        },
      ]);
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'scanner';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'ossindex.enabled':
            this.scannerEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'ossindex.alias.sync.enabled':
            this.aliasSyncEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'ossindex.api.username':
            this.username = item.propertyValue;
            break;
          case 'ossindex.api.token':
            this.apitoken = item.propertyValue;
            break;
        }
      }
    });
  },
};
</script>
