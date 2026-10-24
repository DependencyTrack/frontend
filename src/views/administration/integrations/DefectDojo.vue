<template>
  <b-card no-body :header="header">
    <b-card-body>
      <b-form-group
        :label="$t('admin.integration_defectdojo_enable')"
        label-for="enabled"
      >
        <b-form-checkbox id="enabled" v-model="enabled" switch />
      </b-form-group>
      <b-form-group
        :label="$t('admin.integration_defectdojo_reimport_enable')"
        label-for="reimport-enabled"
      >
        <b-form-checkbox
          id="reimport-enabled"
          v-model="reimportEnabled"
          switch
        />
      </b-form-group>
      <b-validated-input-group-form-input
        id="defectdojo-url"
        :label="$t('admin.url')"
        input-group-size="mb-3"
        required
        type="url"
        v-model="url"
        lazy="true"
      />
      <label for="defectdojo-apiKey"
        >{{ $t('admin.api_token') }}
        <i
          class="fa fa-key text-warning ms-1"
          :title="$t('admin.secret_reference_field')"
        ></i
      ></label>
      <secret-ref-select id="defectdojo-apiKey" v-model="apiKey" />
    </b-card-body>
    <b-card-footer>
      <b-button variant="primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput.vue';
import common from '../../../shared/common';
import SecretRefSelect from '../../components/SecretRefSelect.vue';
import configPropertyMixin from '../mixins/configPropertyMixin';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    BValidatedInputGroupFormInput,
    SecretRefSelect,
  },
  data() {
    return {
      enabled: false,
      reimportEnabled: false,
      url: '',
      apiKey: '',
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
          propertyName: 'defectdojo.url',
          propertyValue: this.url,
        },
        {
          groupName: 'integrations',
          propertyName: 'defectdojo.apiKey',
          propertyValue: this.apiKey,
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
          case 'defectdojo.url':
            this.url = item.propertyValue;
            break;
          case 'defectdojo.apiKey':
            this.apiKey = item.propertyValue;
            break;
        }
      }
    });
  },
};
</script>
