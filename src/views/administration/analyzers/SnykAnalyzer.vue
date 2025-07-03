<template>
  <b-card no-body :header="header">
    <b-card-body>
      <img alt="Snyk logo" src="@/assets/img/snyk-logo.png" height="128px" />
      <hr />
      <c-switch
        :disabled="
          !this.scannerEnabled &&
          (!this.baseUrl || !this.orgId || !this.apitoken || !this.apiVersion)
        "
        id="scannerEnabled"
        color="primary"
        v-model="scannerEnabled"
        label
        v-bind="labelIcon"
      />
      {{ $t('admin.analyzer_snyk_enable') }}
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
      <p class="font-sm text-muted">
        <span class="fa fa-warning">&nbsp;</span>
        {{ $t('admin.analyzer_snyk_alias_sync_warning') }}
      </p>
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
        :label="$t('admin.analyzer_snyk_org_id')"
        input-group-size="mb-3"
        rules="required"
        v-model="orgId"
        lazy="true"
      />
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <a :href="findOrgIdUrl" target="_blank">{{
          $t('admin.analyzer_snyk_how_to_org_id_help')
        }}</a>
      </p>
      <b-validated-input-group-form-input
        id="snyk-apitoken"
        :label="$t('admin.api_token')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="apitoken"
        lazy="true"
      />
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <a :href="findApiTokenUrl" target="_blank">{{
          $t('admin.analyzer_snyk_how_to_api_token_help')
        }}</a>
        <br />
        <span class="fa fa-info-circle"></span>
        {{ $t('admin.analyzer_snyk_multiple_tokens_info')
        }}<code>token1;token2</code>
      </p>
      <b-validated-input-group-form-input
        id="snyk-apiVersion"
        :label="$t('admin.analyzer_snyk_api_version')"
        input-group-size="mb-3"
        rules="required"
        v-model="apiVersion"
        lazy="true"
      />
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <a :href="apiDocsUrl" target="_blank">{{
          $t('admin.analyzer_snyk_how_to_api_version_help')
        }}</a>
        <br />
        <span class="fa fa-warning"></span>
        {{ $t('admin.analyzer_snyk_api_version_warning') }}
      </p>
      <b-row style="margin-top: 2rem">
        <b-col sm="6">
          <b-form-group
            :label="$t('message.cvss_source')"
            v-slot="{ cvssSource }"
          >
            <b-form-radio-group
              v-model="cvssSourceSelected"
              :options="cvssOptions"
              :aria-describedby="cvssSource"
              name="radios-btn-default"
              button-variant="outline-primary"
              class="cvss-calc cvss-calc-3-btn"
              buttons
            />
          </b-form-group>
        </b-col>
      </b-row>
      <p class="font-sm text-muted">
        <span class="fa fa-question-circle">&nbsp;</span>
        <a :href="multipleCvssDocs" target="_blank">{{
          $t('admin.analyzer_snyk_why_multiple_cvss')
        }}</a>
      </p>
      <hr />
      <p>{{ $t('admin.analyzer_snyk_desc') }}</p>
    </b-card-body>
    <b-card-footer>
      <b-button
        :disabled="
          !this.baseUrl || !this.orgId || !this.apitoken || !this.apiVersion
        "
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
import {
  BButton,
  BCard,
  BCardBody,
  BCardFooter,
  BCol,
  BFormGroup,
  BFormRadioGroup,
  BRow,
} from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
    BCard,
    BCardBody,
    BCardFooter,
    BRow,
    BCol,
    BFormGroup,
    BButton,
    BFormRadioGroup,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {
      scannerEnabled: false,
      aliasSyncEnabled: false,
      apitoken: '',
      apiVersion: '',
      baseUrl: '',
      orgId: '',
      cvssOptions: ['NVD', 'SNYK'],
      cvssSourceSelected: '',
      apiDocsUrl: 'https://apidocs.snyk.io',
      multipleCvssDocs:
        'https://docs.snyk.io/features/fixing-and-prioritizing-issues/issue-management/severity-levels#understanding-snyks-vulnerability-analysis',
      findApiTokenUrl:
        'https://docs.snyk.io/snyk-api-info/authentication-for-api',
      findOrgIdUrl:
        'https://docs.snyk.io/products/snyk-code/cli-for-snyk-code/before-you-start-set-the-organization-for-the-cli-tests/finding-the-snyk-id-and-internal-name-of-an-organization',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
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
          case 'snyk.enabled':
            this.scannerEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'snyk.alias.sync.enabled':
            this.aliasSyncEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'snyk.api.token':
            this.apitoken = item.propertyValue;
            break;
          case 'snyk.org.id':
            this.orgId = item.propertyValue;
            break;
          case 'snyk.base.url':
            this.baseUrl = item.propertyValue;
            break;
          case 'snyk.cvss.source':
            this.cvssSourceSelected = item.propertyValue;
            break;
          case 'snyk.api.version':
            this.apiVersion = item.propertyValue;
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
          propertyName: 'snyk.enabled',
          propertyValue: this.scannerEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'snyk.alias.sync.enabled',
          propertyValue: this.aliasSyncEnabled,
        },
        {
          groupName: 'scanner',
          propertyName: 'snyk.api.token',
          propertyValue: this.apitoken,
        },
        {
          groupName: 'scanner',
          propertyName: 'snyk.org.id',
          propertyValue: this.orgId,
        },
        {
          groupName: 'scanner',
          propertyName: 'snyk.base.url',
          propertyValue: this.baseUrl,
        },
        {
          groupName: 'scanner',
          propertyName: 'snyk.cvss.source',
          propertyValue: this.cvssSourceSelected,
        },
        {
          groupName: 'scanner',
          propertyName: 'snyk.api.version',
          propertyValue: this.apiVersion,
        },
      ]);
    },
  },
};
</script>
