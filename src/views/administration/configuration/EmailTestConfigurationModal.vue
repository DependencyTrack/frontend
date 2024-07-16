<template>
  <b-modal
    id="emailTestConfigurationModal"
    size="md"
    @hide="resetValues()"
    hide-header-close
    no-stacking
    :title="$t('admin.configuration_test')"
  >
    <b-validated-input-group-form-input
      id="email-to-address"
      :label="$t('admin.email_address')"
      input-group-size="mb-3"
      rules="required"
      type="email"
      v-model="emailAddress"
      tooltip="Enter an email address you control to test your send configuration."
      lazy="true"
    />
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        @click="[testConfiguration(), cancel()]"
        >{{ $t('admin.perform_test') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import { ValidationObserver } from 'vee-validate';
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';

export default {
  name: 'ProjectPropertiesModal',
  components: {
    BValidatedInputGroupFormInput,
  },
  data() {
    return {
      emailAddress: '',
    };
  },
  methods: {
    testConfiguration: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}/test/email`;
      const params = new URLSearchParams();
      params.append('destination', this.emailAddress);
      this.axios
        .post(url, params, {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        })
        .then((response) => {
          this.$toastr.s(this.$t('admin.test_notification_queued'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.$root.$emit('bv::hide::modal', 'emailTestConfigurationModal');
    },
    resetValues: function () {
      this.emailAddress = '';
    },
  },
};
</script>
