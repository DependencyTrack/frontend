<template>
  <b-modal
    v-model="visible"
    size="lg"
    @hidden="resetValues()"
    no-stacking
    focus="username-input-input"
    :title="$t('admin.create_managed_user')"
    :ok-title="$t('message.create')"
    :cancel-title="$t('message.close')"
    :ok-disabled="submitting || !createReady"
    :no-close-on-esc="submitting"
    :no-close-on-backdrop="submitting"
    @ok.prevent="createUser()"
  >
    <b-form @submit.prevent="createReady && createUser()">
      <b-row>
        <b-col>
          <b-input-group-form-input
            id="username-input"
            input-group-size="mb-3"
            type="text"
            v-model="username"
            lazy="true"
            required="true"
            feedback="true"
            autofocus="false"
            :label="$t('message.username')"
            :feedback-text="$t('admin.required_username')"
          />
          <b-input-group-form-input
            id="fullname-input"
            input-group-size="mb-3"
            type="text"
            v-model="fullname"
            lazy="true"
            required="true"
            feedback="true"
            autofocus="false"
            :label="$t('message.fullname')"
            :feedback-text="$t('admin.required_fullname')"
          />
          <b-input-group-form-input
            id="email-input"
            input-group-size="mb-3"
            type="text"
            v-model="email"
            lazy="true"
            required="true"
            feedback="true"
            autofocus="false"
            :label="$t('message.email')"
            :feedback-text="$t('admin.required_email')"
          />
        </b-col>
        <b-col>
          <b-input-group-form-input
            id="password-input"
            input-group-size="mb-3"
            type="password"
            v-model="password"
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
          <b-form-checkbox
            id="forcePasswordChange"
            v-model="forcePasswordChange"
            switch
            >{{ $t('admin.change_password_next_login') }}</b-form-checkbox
          >
          <b-form-checkbox
            id="nonExpiryPassword"
            v-model="nonExpiryPassword"
            switch
            >{{ $t('admin.password_never_expires') }}</b-form-checkbox
          >
        </b-col>
      </b-row>
      <button type="submit" style="display: none" />
    </b-form>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput.vue';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  components: {
    BInputGroupFormInput,
  },
  emits: ['refreshTable'],
  data() {
    return {
      submitting: false,
      username: null,
      fullname: null,
      email: null,
      password: null,
      confirmPassword: null,
      forcePasswordChange: false,
      nonExpiryPassword: false,
    };
  },
  computed: {
    createReady: function () {
      return (
        this.username?.length > 0 &&
        this.fullname?.length > 0 &&
        this.email?.length > 0 &&
        this.password?.length > 0 &&
        this.confirmPassword?.length > 0
      );
    },
  },
  methods: {
    verifyPasswordState: function () {
      return (
        this.password !== undefined &&
        this.password !== null &&
        this.password.length > 0 &&
        this.confirmPassword !== undefined &&
        this.confirmPassword !== null &&
        this.confirmPassword.length > 0 &&
        this.password === this.confirmPassword
      );
    },
    createUser: function () {
      if (this.submitting) return;
      this.submitting = true;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`;
      this.axios
        .put(url, {
          username: this.username,
          fullname: this.fullname,
          email: this.email,
          newPassword: this.password,
          confirmPassword: this.confirmPassword,
          forcePasswordChange: this.forcePasswordChange,
          nonExpiryPassword: this.nonExpiryPassword,
          suspended: false,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.user_created'));
          this.visible = false;
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        })
        .finally(() => {
          this.submitting = false;
        });
    },
    resetValues: function () {
      this.username = null;
      this.fullname = null;
      this.email = null;
      this.password = null;
      this.confirmPassword = null;
      this.forcePasswordChange = false;
      this.nonExpiryPassword = false;
    },
  },
};
</script>
