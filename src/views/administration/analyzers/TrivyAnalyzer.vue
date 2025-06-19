<template>
  <b-card no-body :header="header">
    <b-card-body>
      <img alt="Trivy logo" src="@/assets/img/trivy-logo.svg" width="125" />
      <hr />
      <c-switch
        :disabled="!this.scannerEnabled && (!this.baseUrl || !this.apitoken)"
        id="scannerEnabled"
        color="primary"
        v-model="scannerEnabled"
        label
        v-bind="labelIcon"
      />
      {{ $t('admin.analyzer_trivy_enable') }}
      <b-validated-input-group-form-input
        id="trivy-baseUrl"
        :label="$t('admin.base_url')"
        input-group-size="mb-3"
        rules="required"
        v-model="baseUrl"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="trivy-apitoken"
        :label="$t('admin.api_token')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="apitoken"
        lazy="true"
      />
      <c-switch
        id="ignoreUnfixed"
        color="primary"
        v-model="ignoreUnfixed"
        label
        v-bind="labelIcon"
      />
      {{ $t('admin.analyzer_trivy_ignore_unfixed') }}
      <br />
      <c-switch
        id="ignoreUnfixed"
        color="primary"
        v-model="scanLibrary"
        label
        v-bind="labelIcon"
      />
      {{ $t('admin.analyzer_trivy_scan_library') }}
      <br />
      <c-switch
        id="ignoreUnfixed"
        color="primary"
        v-model="scanOs"
        label
        v-bind="labelIcon"
      />
      {{ $t('admin.analyzer_trivy_scan_os') }}
    </b-card-body>
    <b-card-footer>
      <b-button
        :disabled="!this.baseUrl || !this.apitoken"
        variant="outline-primary"
        class="px-4"
        @click="saveChanges"
      >
        {{ $t('message.update') }}
      </b-button>
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
      apitoken: '',
      baseUrl: '',
      ignoreUnfixed: false,
      scanLibrary: true,
      scanOs: true,
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      const configItems = response.data.filter(function (item) {
        return item.groupName === 'scanner';
      });
      for (let i = 0; i < configItems.length; i++) {
        const item = configItems[i];
        switch (item.propertyName) {
          case 'trivy.enabled':
            this.scannerEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'trivy.api.token':
            this.apitoken = item.propertyValue;
            break;
          case 'trivy.base.url':
            this.baseUrl = item.propertyValue;
            break;
          case 'trivy.ignore.unfixed':
            this.ignoreUnfixed = common.toBoolean(item.propertyValue);
            break;
          case 'trivy.scanner.scanLibrary':
            this.scanLibrary = common.toBoolean(item.propertyValue);
            break;
          case 'trivy.scanner.scanOs':
            this.scanOs = common.toBoolean(item.propertyValue);
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
          propertyName: 'trivy.enabled',
          propertyValue: this.scannerEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'trivy.api.token',
          propertyValue: this.apitoken,
        },
        {
          groupName: 'scanner',
          propertyName: 'trivy.base.url',
          propertyValue: this.baseUrl,
        },
        {
          groupName: 'scanner',
          propertyName: 'trivy.ignore.unfixed',
          propertyValue: this.ignoreUnfixed,
        },
        {
          groupName: 'scanner',
          propertyName: 'trivy.scanner.scanLibrary',
          propertyValue: this.scanLibrary,
        },
        {
          groupName: 'scanner',
          propertyName: 'trivy.scanner.scanOs',
          propertyValue: this.scanOs,
        },
      ]);
    },
  },
};
</script>
