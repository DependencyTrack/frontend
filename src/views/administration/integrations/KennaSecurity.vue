<template>
  <b-card no-body :header="header">
    <b-card-body>
      <b-form-group :label="$t('admin.integration_kenna_enable')">
        <c-switch
          id="enabled"
          color="primary"
          v-model="enabled"
          label
          v-bind="labelIcon"
        />
      </b-form-group>
      <b-validated-input-group-form-input
        id="kenna-connector.id"
        :label="$t('admin.integration_kenna_connector_id')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="connectorId"
        lazy="true"
      />
      <label for="kenna-token"
        >{{ $t('admin.token') }}
        <i
          class="fa fa-key text-warning ml-1"
          :title="$t('admin.secret_reference_field')"
        ></i
      ></label>
      <secret-ref-select id="kenna-token" v-model="token" />
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
    cSwitch,
    BValidatedInputGroupFormInput,
    SecretRefSelect,
  },
  data() {
    return {
      enabled: false,
      connectorId: '',
      token: '',
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
          propertyName: 'kenna.enabled',
          propertyValue: this.enabled,
        },
        {
          groupName: 'integrations',
          propertyName: 'kenna.connector.id',
          propertyValue: this.connectorId,
        },
        {
          groupName: 'integrations',
          propertyName: 'kenna.token',
          propertyValue: this.token,
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
          case 'kenna.enabled':
            this.enabled = common.toBoolean(item.propertyValue);
            break;
          case 'kenna.connector.id':
            this.connectorId = item.propertyValue;
            break;
          case 'kenna.token':
            this.token = item.propertyValue;
            break;
        }
      }
    });
  },
};
</script>
