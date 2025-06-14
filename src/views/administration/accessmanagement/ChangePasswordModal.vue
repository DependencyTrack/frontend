<template>
  <b-modal
    id="changePasswordModal"
    size="md"
    @hide="resetValues()"
    hide-header-close
    no-stacking
    :title="$t('admin.change_password')"
  >
    <b-input-group-form-input
      id="password-input"
      input-group-size="mb-3"
      type="password"
      v-model="newPassword"
      lazy="true"
      required="true"
      feedback="true"
      autofocus="false"
      :label="$t('message.password')"
      :feedback-text="$t('admin.required_password')"
    />
    <b-input-group-form-input
      id="confirmPassword-input"
      input-group-size="mb-3"
      type="password"
      v-model="confirmPassword"
      lazy="true"
      required="true"
      feedback="true"
      autofocus="false"
      :state="verifyPasswordState()"
      :label="$t('admin.password_confirm')"
      :feedback-text="$t('admin.required_confirmPassword')"
    />

    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="updatePassword()">{{
        $t('message.update')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import { BButton, BModal } from 'bootstrap-vue';

export default {
  components: {
    BInputGroupFormInput,
    BModal,
    BButton,
  },
  mixins: [permissionsMixin],
  props: {
    managedUser: Object,
  },
  data() {
    return {
      newPassword: null,
      confirmPassword: null,
    };
  },
  methods: {
    verifyPasswordState: function () {
      return (
        this.newPassword !== undefined &&
        this.newPassword !== null &&
        this.newPassword.length > 0 &&
        this.confirmPassword !== undefined &&
        this.confirmPassword !== null &&
        this.confirmPassword.length > 0 &&
        this.newPassword === this.confirmPassword
      );
    },
    updatePassword: function () {
      if (this.verifyPasswordState()) {
        const url = `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`;
        this.axios
          .post(url, {
            username: this.managedUser.username,
            fullname: this.managedUser.fullname,
            email: this.managedUser.email,
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword,
            forcePasswordChange: this.managedUser.forcePasswordChange,
            nonExpiryPassword: this.managedUser.nonExpiryPassword,
            suspended: this.managedUser.suspended,
          })
          .then((response) => {
            this.$toastr.s(this.$t('admin.password_updated'));
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
        this.$root.$emit('bv::hide::modal', 'changePasswordModal');
        this.resetValues();
      }
    },
    resetValues: function () {
      this.newPassword = null;
      this.confirmPassword = null;
    },
  },
};
</script>
