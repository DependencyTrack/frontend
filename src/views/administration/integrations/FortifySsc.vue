<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="enabled"
        color="primary"
        v-model="enabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.integration_fortify_ssc_enable') }}
      <b-validated-input-group-form-input
        id="fortify-ssc-cadence"
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
        id="fortify-ssc-url"
        :label="$t('admin.url')"
        input-group-size="mb-3"
        rules="required"
        type="url"
        v-model="url"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="fortify-ssc-token"
        :label="$t('admin.token')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="token"
        lazy="true"
      />
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
      enabled: false,
      cadence: '60',
      url: '',
      token: '',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      const configItems = response.data.filter(function (item) {
        return item.groupName === 'integrations';
      });
      for (let i = 0; i < configItems.length; i++) {
        const item = configItems[i];
        switch (item.propertyName) {
          case 'fortify.ssc.enabled':
            this.enabled = common.toBoolean(item.propertyValue);
            break;
          case 'fortify.ssc.sync.cadence':
            this.cadence = item.propertyValue;
            break;
          case 'fortify.ssc.url':
            this.url = item.propertyValue;
            break;
          case 'fortify.ssc.token':
            this.token = item.propertyValue;
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'integrations',
          propertyName: 'fortify.ssc.enabled',
          propertyValue: this.enabled,
        },
        {
          groupName: 'integrations',
          propertyName: 'fortify.ssc.sync.cadence',
          propertyValue: this.cadence,
        },
        {
          groupName: 'integrations',
          propertyName: 'fortify.ssc.url',
          propertyValue: this.url,
        },
        {
          groupName: 'integrations',
          propertyName: 'fortify.ssc.token',
          propertyValue: this.token,
        },
      ]);
    },
  },
};
</script>
