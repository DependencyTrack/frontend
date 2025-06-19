<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch
        id="email-enabled"
        color="primary"
        v-model="isEmailEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.enable_email') }}
      <b-validated-input-group-form-input
        id="email-from-address"
        :label="$t('admin.email_from_address')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="emailFromAddress"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="email-prefix"
        :label="$t('admin.email_prefix')"
        input-group-size="mb-3"
        type="text"
        v-model="emailPrefix"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="email-smtp-server"
        :label="$t('admin.email_smtp_server')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="emailSmtpServer"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="email-smtp-port"
        :label="$t('admin.email_smtp_port')"
        input-group-size="mb-3"
        rules="required"
        type="number"
        v-model="emailSmtpPort"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="email-smtp-username"
        :label="$t('admin.email_smtp_username')"
        input-group-size="mb-3"
        type="text"
        v-model="emailSmtpUsername"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="email-smtp-password"
        :label="$t('admin.email_smtp_password')"
        input-group-size="mb-3"
        type="password"
        v-model="emailSmtpPassword"
        lazy="true"
        conceal="true"
      />
      <c-switch
        id="email-smtp-enable-ssltls"
        color="primary"
        v-model="isSmtpSslTlsEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.email_enable_ssltls') }}
      <br />
      <c-switch
        id="email-smtp-trust-cert"
        color="primary"
        v-model="isEmailSmtpTrustCertEnabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.email_trust_cert') }}
    </b-card-body>
    <b-card-footer>
      <b-button
        size="md"
        class="px-4"
        variant="outline-primary"
        @click="saveChanges"
        >{{ $t('message.update') }}</b-button
      >
      <b-button
        size="md"
        class="px-4"
        variant="outline-primary"
        v-b-modal.emailTestConfigurationModal
        >{{ $t('admin.configuration_test') }}</b-button
      >
    </b-card-footer>
    <email-test-configuration-modal />
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import common from '@/shared/common';
import EmailTestConfigurationModal from './EmailTestConfigurationModal';
import { BButton, BCard, BCardBody, BCardFooter } from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
    EmailTestConfigurationModal,
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
      isEmailEnabled: false,
      emailFromAddress: '',
      emailPrefix: '',
      emailSmtpServer: '',
      emailSmtpPort: '',
      emailSmtpUsername: '',
      emailSmtpPassword: '',
      isSmtpSslTlsEnabled: false,
      isEmailSmtpTrustCertEnabled: false,
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      const configItems = response.data.filter(function (item) {
        return item.groupName === 'email';
      });
      for (let i = 0; i < configItems.length; i++) {
        const item = configItems[i];
        switch (item.propertyName) {
          case 'smtp.enabled':
            this.isEmailEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'smtp.from.address':
            this.emailFromAddress = item.propertyValue;
            break;
          case 'subject.prefix':
            this.emailPrefix = item.propertyValue;
            break;
          case 'smtp.server.hostname':
            this.emailSmtpServer = item.propertyValue;
            break;
          case 'smtp.server.port':
            this.emailSmtpPort = item.propertyValue;
            break;
          case 'smtp.username':
            this.emailSmtpUsername = item.propertyValue;
            break;
          case 'smtp.password':
            this.emailSmtpPassword = item.propertyValue;
            break; // "HiddenDecryptedPropertyPlaceholder"
          case 'smtp.ssltls':
            this.isSmtpSslTlsEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'smtp.trustcert':
            this.isEmailSmtpTrustCertEnabled = common.toBoolean(
              item.propertyValue,
            );
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'email',
          propertyName: 'smtp.enabled',
          propertyValue: this.isEmailEnabled,
        },
        {
          groupName: 'email',
          propertyName: 'smtp.from.address',
          propertyValue: this.emailFromAddress,
        },
        {
          groupName: 'email',
          propertyName: 'subject.prefix',
          propertyValue: this.emailPrefix,
        },
        {
          groupName: 'email',
          propertyName: 'smtp.server.hostname',
          propertyValue: this.emailSmtpServer,
        },
        {
          groupName: 'email',
          propertyName: 'smtp.server.port',
          propertyValue: this.emailSmtpPort,
        },
        {
          groupName: 'email',
          propertyName: 'smtp.username',
          propertyValue: this.emailSmtpUsername,
        },
        {
          groupName: 'email',
          propertyName: 'smtp.ssltls',
          propertyValue: this.isSmtpSslTlsEnabled,
        },
        {
          groupName: 'email',
          propertyName: 'smtp.trustcert',
          propertyValue: this.isEmailSmtpTrustCertEnabled,
        },
      ]);
      if (this.emailSmtpPassword !== 'HiddenDecryptedPropertyPlaceholder') {
        this.updateConfigProperty(
          'email',
          'smtp.password',
          this.emailSmtpPassword,
        );
      }
      if (typeof this.emailPrefix == 'undefined') {
        this.updateConfigProperty('email', 'subject.prefix', ' ');
      }
    },
  },
};
</script>
