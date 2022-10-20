<template>
    <b-card no-body :header="header">
      <b-card-body>
        <c-switch id="scannerEnabled" color="primary" v-model="scannerEnabled" label v-bind="labelIcon" />{{$t('admin.analyzer_snyk_enable')}}
        <hr/>
        <b-validated-input-group-form-input
          id="snyk-baseUrl"
          :label="$t('admin.base_url')"
          input-group-size="mb-3"
          rules="required"
          v-model="baseUrl"
          lazy="true"
        />
        <b-validated-input-group-form-input
          id="snyk-orgId"
          :label="$t('admin.org_id')"
          input-group-size="mb-3"
          rules="required"
          v-model="orgId"
          lazy="true"
        />
        <b-validated-input-group-form-input
          id="snyk-apitoken"
          :label="$t('admin.api_token')"
          input-group-size="mb-3"
          rules="required"
          type="password"
          v-model="apitoken"
          lazy="true"
        />
        <b-validated-input-group-form-input
          id="snyk-apiVersion"
          :label="$t('admin.api_version')"
          input-group-size="mb-3"
          rules="required"
          v-model="apiVersion"
          lazy="true"
        />
        <b-row style="margin-top:2rem;">
          <b-col sm="6">
            <b-form-group :label="$t('message.cvss_source')" v-slot="{ cvssSource }">
              <b-form-radio-group v-model="cvssSourceSelected" :options="cvssOptions"
                                  :aria-describedby="cvssSource" name="radios-btn-default"
                                  v-on:change="generateCvssV2Vector" button-variant="outline-primary"
                                  class="cvss-calc cvss-calc-3-btn" buttons />
            </b-form-group>
          </b-col>
        </b-row>
        <a :href="apiDocUrl">{{$t('admin.analyzer_snyk_why_multiple_cvss')}}</a>
        <hr/>
        {{ $t('admin.analyzer_snyk_desc') }}
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
          scannerEnabled: false,
          apitoken: '',
          apiVersion: '',
          baseUrl: '',
          orgId: '',
          cvssOptions: [
            'NVD',
            'SNYK'
          ],
          cvssSourceSelected: '',
          apiDocUrl: 'https://docs.snyk.io/features/fixing-and-prioritizing-issues/issue-management/severity-levels#understanding-snyks-vulnerability-analysis',
          labelIcon: {
            dataOn: '\u2713',
            dataOff: '\u2715'
          },
        }
      },
      methods: {
        saveChanges: function() {
          this.updateConfigProperties([
            {groupName: 'scanner', propertyName: 'snyk.enabled', propertyValue: this.scannerEnabled},
            {groupName: 'scanner', propertyName: 'snyk.api.token', propertyValue: this.apitoken},
            {groupName: 'scanner', propertyName: 'snyk.org.id', propertyValue: this.orgId},
            {groupName: 'scanner', propertyName: 'snyk.base.url', propertyValue: this.baseUrl},
            {groupName: 'scanner', propertyName: 'snyk.cvss.source', propertyValue: this.cvssSourceSelected},
            {groupName: 'scanner', propertyName: 'snyk.api.version', propertyValue: this.apiVersion}
          ]);
        }
      },
      created () {
        this.axios.get(this.configUrl).then((response) => {
          let configItems = response.data.filter(function (item) { return item.groupName === "scanner" });
          for (let i=0; i<configItems.length; i++) {
            let item = configItems[i];
            switch (item.propertyName) {
              case "snyk.enabled":
                this.scannerEnabled = common.toBoolean(item.propertyValue); break;
              case "snyk.api.token":
                this.apitoken = item.propertyValue; break;
              case "snyk.org.id":
              this.orgId = item.propertyValue; break;
              case "snyk.base.url":
                this.baseUrl = item.propertyValue; break;
              case "snyk.cvss.source":
                this.cvssSourceSelected = item.propertyValue; break;
              case "snyk.api.version":
                this.apiVersion = item.propertyValue; break;
            }
          }
        });
      }
    }
  </script>