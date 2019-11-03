<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <validation-observer tag="form" v-slot="{ passes }">
                  <b-form @submit.prevent="passes(changePassword)">
                    <h1>{{ $t('message.password_force_change') }}</h1>
                    <p class="text-muted">{{ $t('message.password_force_change_desc') }}</p>
                    <b-validated-input-group-form-input
                      name="username"
                      :label="$t('message.username')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-user"
                      type="text"
                      autocomplete="username email"
                      :value="input.username"
                      v-on:input="input.username = $event"
                    />
                    <b-validated-input-group-form-input
                      name="current-password"
                      :label="$t('message.password_current')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-lock"
                      type="password"
                      autocomplete="current-password"
                      :value="input.password"
                      v-on:input="input.password = $event"
                    />
                    <b-validated-input-group-form-input
                      name="new-password"
                      :label="$t('message.password_new')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-lock"
                      type="password"
                      autocomplete="off"
                      :value="input.newPassword"
                      v-on:input="input.newPassword = $event"
                    />
                    <b-validated-input-group-form-input
                      name="confirm-password"
                      :label="$t('message.password_confirm')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-lock"
                      type="password"
                      autocomplete="off"
                      :value="input.confirmPassword"
                      v-on:input="input.confirmPassword = $event"
                    />
                    <b-row>
                      <b-col>
                        <b-button block variant="primary" class="px-4" type="submit">{{ $t('message.password_change') }}</b-button>
                      </b-col>
                    </b-row>
                  </b-form>
                </validation-observer>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-gray-900 py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <img src="img/brand/logo-symbol-greyscale.svg" width="60%"/>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
    <InformationalModal v-bind:message="passwordChangeError"/>
  </div>
</template>

<script>
  import axios from 'axios'
  import { ValidationObserver } from 'vee-validate';
  import api from '../../shared/api';
  import InformationalModal from '../modals/InformationalModal'
  import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput';
  const qs = require('querystring');

  export default {
    name: 'PasswordForceChange',
    components: {
      BValidatedInputGroupFormInput,
      InformationalModal,
      ValidationObserver
    },
    data() {
      return {
        passwordChangeError: "",
        input: {
          username: "",
          password: "",
          newPassword: "",
          confirmPassword: ""
        }
      }
    },
    methods: {
      changePassword() {
        const url = `${api.BASE_URL}/${api.URL_FORCE_PW_CHANGE}`;
        const requestBody = {
          username: this.input.username,
          password: this.input.password,
          newPassword: this.input.newPassword,
          confirmPassword: this.input.confirmPassword
        };
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        axios.post(url, qs.stringify(requestBody), config)
          .then((result) => {
            if (result.status === 200) {
              this.$root.$bvToast.toast(this.$t('message.password_change_success'), {
                title: this.$t('message.password_change'),
                variant: 'success'
              });
              // We don't get the JWT token on a successful password change,
              // reroute users back to login
              this.$router.replace({ name: "Login" });
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              this.$bvModal.show('modal-informational');
              this.passwordChangeError = this.$t('message.password_unauthorized');
            } else if (err.response.status === 406) {
              this.$bvModal.show('modal-informational');
              this.passwordChangeError = this.$t('message.password_not_acceptable');
            }
          })
      }
    }
  }
</script>
