<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="enabled"
        color="primary"
        v-model="enabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.integration_defectdojo_enable') }}
      <c-switch
        id="reimport-enabled"
        color="primary"
        v-model="reimportEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.integration_defectdojo_reimport_enable') }}
      <c-switch
        id="autocreate-enabled"
        color="primary"
        v-model="autocreateEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.integration_defectdojo_autocreate_enable') }}
      <b-validated-input-group-form-input
        id="defectdojo-cadence"
        :label="$t('admin.synchronization_cadence_minutes')"
        input-group-size="mb-3"
        rules="required"
        type="number"
        v-model="cadence"
        lazy="true"
      />
      <p class="text-muted">
        {{ $t('admin.synchronization_cadence_restart_required') }}
      </p>
      <b-validated-input-group-form-input
        id="defectdojo-url"
        :label="$t('admin.url')"
        input-group-size="mb-3"
        rules="required"
        type="url"
        v-model="url"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="defectdojo-apiKey"
        :label="$t('admin.api_token')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="apiKey"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="defectdojo-autocreate-engagement-name"
        :label="$t('admin.integration_defectdojo_autocreate_engagement_name')"
        input-group-size="mb-3"
        type="text"
        v-model="autocreateEngagementName"
        lazy="true"
        :disabled="!autocreateEnabled"
      />
      <p class="text-muted">
        {{ $t('admin.integration_defectdojo_autocreate_engagement_name_help') }}
      </p>
      <b-validated-input-group-form-input
        id="defectdojo-autocreate-product-type-name"
        :label="$t('admin.integration_defectdojo_autocreate_product_type_name')"
        input-group-size="mb-3"
        type="text"
        v-model="autocreateProductTypeName"
        lazy="true"
        :disabled="!autocreateEnabled"
      />
      <p class="text-muted">
        {{ $t('admin.integration_defectdojo_autocreate_product_type_name_help') }}
      </p>
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
      enabled: false,
      reimportEnabled: false,
      autocreateEnabled: false,
      cadence: '60',
      url: '',
      apiKey: '',
      autocreateEngagementName: 'dependencytrack',
      autocreateProductTypeName: 'Dependency Track',
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
          groupName: 'integrations',
          propertyName: 'defectdojo.enabled',
          propertyValue: this.enabled,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.reimport.enabled',
          propertyValue: this.reimportEnabled,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.autocreate.enabled',
          propertyValue: this.autocreateEnabled,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.sync.cadence',
          propertyValue: this.cadence,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.url',
          propertyValue: this.url,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.apiKey',
          propertyValue: this.apiKey,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.autocreate.engagementName',
          propertyValue: this.autocreateEngagementName,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.autocreate.productTypeName',
          propertyValue: this.autocreateProductTypeName,
        },
      ]);
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'integrations';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'defectdojo.enabled':
            this.enabled = common.toBoolean(item.propertyValue);
            break;
          case 'defectdojo.reimport.enabled':
            this.reimportEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'defectdojo.autocreate.enabled':
            this.autocreateEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'defectdojo.sync.cadence':
            this.cadence = item.propertyValue;
            break;
          case 'defectdojo.url':
            this.url = item.propertyValue;
            break;
          case 'defectdojo.apiKey':
            this.apiKey = item.propertyValue;
            break;
          case 'defectdojo.autocreate.engagementName':
            this.autocreateEngagementName = item.propertyValue;
            break;
          case 'defectdojo.autocreate.productTypeName':
            this.autocreateProductTypeName = item.propertyValue;
            break;
        }
      }
    });
  },
};
</script>
