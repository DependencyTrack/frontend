<template>
  <b-modal id="createManagedUserModal" size="lg" @hide="resetValues()" hide-header-close no-stacking :title="$t('admin.create_managed_user')">
    <b-row>
      <b-col>
        <b-input-group-form-input id="username-input" input-group-size="mb-3" type="text" v-model="username"
                                  lazy="true" required="true" feedback="true" autofocus="false"
                                  :label="$t('message.username')"
                                  :feedback-text="$t('admin.required_username')" />
        <b-input-group-form-input id="fullname-input" input-group-size="mb-3" type="text" v-model="fullname"
                                  lazy="true" required="true" feedback="true" autofocus="false"
                                  :label="$t('message.fullname')"
                                  :feedback-text="$t('admin.required_fullname')" />
        <b-input-group-form-input id="email-input" input-group-size="mb-3" type="text" v-model="email"
                                  lazy="true" required="true" feedback="true" autofocus="false"
                                  :label="$t('message.email')"
                                  :feedback-text="$t('admin.required_email')" />
      </b-col>
      <b-col>
        <b-input-group-form-input id="password-input" input-group-size="mb-3" type="password" v-model="password"
                                  lazy="true" required="true" feedback="true" autofocus="false"
                                  :label="$t('message.password')"
                                  :feedback-text="$t('admin.required_password')" />
        <b-input-group-form-input id="confirmPassword-input" input-group-size="mb-3" type="text" v-model="confirmPassword"
                                  lazy="true" required="true" feedback="true" autofocus="false"
                                  :state="verifyPasswordState()"
                                  :label="$t('admin.password_confirm')"
                                  :feedback-text="$t('admin.required_confirmPassword')" />
        <c-switch id="forcePasswordChange" color="primary" v-model="forcePasswordChange" label v-bind="labelIcon" />{{$t('admin.change_password_next_login')}}
        <br/>
        <c-switch id="nonExpiryPassword" color="primary" v-model="nonExpiryPassword" label v-bind="labelIcon" />{{$t('admin.password_never_expires')}}
      </b-col>
    </b-row>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="createUser()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import {Switch as cSwitch} from "@coreui/vue";
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";

  export default {
    mixins: [permissionsMixin],
    components: {
      BInputGroupFormInput,
      cSwitch
    },
    data() {
      return {
        username: null,
        fullname: null,
        email: null,
        password: null,
        confirmPassword: null,
        forcePasswordChange: false,
        nonExpiryPassword: false,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        }
      }
    },
    methods: {
      verifyPasswordState: function() {
        return this.password !== undefined && this.password !== null && this.password.length > 0
          && this.confirmPassword !== undefined && this.confirmPassword !== null && this.confirmPassword.length > 0
          && this.password === this.confirmPassword;
      },
      createUser: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`;
        this.axios.put(url,{
          username: this.username,
          fullname: this.fullname,
          email: this.email,
          newPassword: this.password,
          confirmPassword: this.confirmPassword,
          forcePasswordChange: this.forcePasswordChange,
          nonExpiryPassword: this.nonExpiryPassword,
          suspended: false
        }).then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.user_created'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
        this.$root.$emit('bv::hide::modal', 'createManagedUserModal');
        this.resetValues();
      },
      resetValues: function () {
        this.username = null;
        this.fullname = null;
        this.email = null;
        this.password = null;
        this.confirmPassword = null;
        this.forcePasswordChange = false;
        this.nonExpiryPassword = false;
      }
    }
  }
</script>
