<template>
  <b-card no-body :header="header">
    <b-card-body>
      <CSwitch id="email-enabled" color="primary" :checked.sync="isEmailEnabled" label />{{$t('admin.enable_email')}}
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
      <CSwitch id="email-smtp-enable-ssltls" color="primary" :checked.sync="isSmtpSslTlsEnabled" label />{{$t('admin.email_enable_ssltls')}}
      <br/>
      <CSwitch id="email-smtp-trust-cert" color="primary" :checked.sync="isEmailSmtpTrustCertEnabled" label />{{$t('admin.email_trust_cert')}}
    </b-card-body>
    <b-card-footer>
      <b-button size="md" class="px-4" variant="outline-primary" @click="saveChanges">{{ $t('message.update') }}</b-button>
      <b-button size="md" class="px-4" variant="outline-primary" v-b-modal.emailTestConfigurationModal>{{ $t('admin.configuration_test') }}</b-button>
    </b-card-footer>
    <email-test-configuration-modal />
  </b-card>
</template>

<script>
  import { CSwitch } from '@coreui/vue';
  import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
  import common from "../../../shared/common";
  import configPropertyMixin from "../mixins/configPropertyMixin";
  import EmailTestConfigurationModal from "./EmailTestConfigurationModal";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      CSwitch,
      BValidatedInputGroupFormInput,
      EmailTestConfigurationModal
    },
    data() {
      return {
        isEmailEnabled: false,
        emailFromAddress: '',
        emailSmtpServer: '',
        emailSmtpPort: '',
        emailSmtpUsername: '',
        emailSmtpPassword: '',
        isSmtpSslTlsEnabled: false,
        isEmailSmtpTrustCertEnabled: false
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'email', propertyName: 'smtp.enabled', propertyValue: this.isEmailEnabled},
          {groupName: 'email', propertyName: 'smtp.from.address', propertyValue: this.emailFromAddress},
          {groupName: 'email', propertyName: 'smtp.server.hostname', propertyValue: this.emailSmtpServer},
          {groupName: 'email', propertyName: 'smtp.server.port', propertyValue: this.emailSmtpPort},
          {groupName: 'email', propertyName: 'smtp.username', propertyValue: this.emailSmtpUsername},
          {groupName: 'email', propertyName: 'smtp.ssltls', propertyValue: this.isSmtpSslTlsEnabled},
          {groupName: 'email', propertyName: 'smtp.trustcert', propertyValue: this.isEmailSmtpTrustCertEnabled}
        ]);
        if (this.emailSmtpPassword !== "HiddenDecryptedPropertyPlaceholder") {
          this.updateConfigProperty("email", "smtp.password", this.emailSmtpPassword);
        }
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "email" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "smtp.enabled":
              this.isEmailEnabled = common.toBoolean(item.propertyValue); break;
            case "smtp.from.address":
              this.emailFromAddress = item.propertyValue; break;
            case "smtp.server.hostname":
              this.emailSmtpServer = item.propertyValue; break;
            case "smtp.server.port":
              this.emailSmtpPort = item.propertyValue; break;
            case "smtp.username":
              this.emailSmtpUsername = item.propertyValue; break;
            case "smtp.password":
              this.emailSmtpPassword = item.propertyValue; break; // "HiddenDecryptedPropertyPlaceholder"
            case "smtp.ssltls":
              this.isSmtpSslTlsEnabled = common.toBoolean(item.propertyValue); break;
            case "smtp.trustcert":
              this.isEmailSmtpTrustCertEnabled = common.toBoolean(item.propertyValue); break;
          }
        }
      });
    }
  }
</script>
