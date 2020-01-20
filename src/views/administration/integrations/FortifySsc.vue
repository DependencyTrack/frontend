<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch id="enabled" color="primary" v-model="enabled" label v-bind="labelIcon" />{{$t('admin.integration_fortify_ssc_enable')}}
      <b-validated-input-group-form-input
        id="fortify-ssc-cadence"
        :label="$t('admin.synchronization_cadence_minutes')"
        input-group-size="mb-3"
        rules="required"
        type="number"
        v-model="cadence"
        lazy="true"
      />
      <p class="text-muted">{{ $t('admin.synchronization_cadence_restart_required') }}</p>
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
        id="fortify-ssc-username"
        :label="$t('message.username')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="username"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="fortify-ssc-password"
        :label="$t('message.password')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="password"
        lazy="true"
      />
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
  import common from "../../../shared/common";
  import configPropertyMixin from "../mixins/configPropertyMixin";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      cSwitch,
      BValidatedInputGroupFormInput
    },
    data() {
      return {
        enabled: false,
        cadence: '60',
        url: '',
        username: '',
        password: '',
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'integrations', propertyName: 'fortify.ssc.enabled', propertyValue: this.enabled},
          {groupName: 'integrations', propertyName: 'fortify.ssc.sync.cadence', propertyValue: this.cadence},
          {groupName: 'integrations', propertyName: 'fortify.ssc.url', propertyValue: this.url},
          {groupName: 'integrations', propertyName: 'fortify.ssc.username', propertyValue: this.username},
          {groupName: 'integrations', propertyName: 'fortify.ssc.password', propertyValue: this.password}
        ]);
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "integrations" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "fortify.ssc.enabled":
              this.enabled = common.toBoolean(item.propertyValue); break;
            case "fortify.ssc.sync.cadence":
              this.cadence = item.propertyValue; break;
            case "fortify.ssc.url":
              this.url = item.propertyValue; break;
            case "fortify.ssc.username":
              this.username = item.propertyValue; break;
            case "fortify.ssc.password":
              this.password = item.propertyValue; break;
          }
        }
      });
    }
  }
</script>
