<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <validation-observer tag="form" v-slot="{ passes }">
                  <b-form @submit.prevent.stop="passes(login)">
                    <h1>{{ $t('message.login') }}</h1>
                    <p class="text-muted">{{ $t('message.login_desc') }}</p>
                    <b-validated-input-group-form-input
                      id="username"
                      :label="$t('message.username')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-user"
                      type="text"
                      autocomplete="username email"
                      v-model="input.username"
                      autofocus="true"
                      lazy="true"
                    />
                    <b-validated-input-group-form-input
                      name="password"
                      :label="$t('message.password')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-lock"
                      type="password"
                      autcomplete="currentpassword"
                      v-model="input.password"
                      lazy="true"
                    />
                    <b-row>
                      <b-col cols="6">
                        <b-button variant="primary" type="submit" class="px-4">{{ $t('message.login') }}</b-button>
                      </b-col>
                    </b-row>
                  </b-form>
                </validation-observer>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-grey-900 py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <img src="@/assets/img/brand/logo-symbol-greyscale.svg" width="60%"/>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
    <informational-modal v-bind:message="loginError"/>
  </div>
</template>

<script>
  import axios from 'axios'
  // bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
  import $ from 'jquery'
  import { ValidationObserver } from 'vee-validate'
  import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput'
  import InformationalModal from '../modals/InformationalModal'
  const qs = require('querystring');

  export default {
    name: 'Login',
    components: {
      InformationalModal,
      BValidatedInputGroupFormInput,
      ValidationObserver
    },
    data() {
      return {
        loginError: "",
        input: {
          username: "",
          password: ""
        }
      }
    },
    methods: {
      login() {
        const url = this.$api.BASE_URL + "/" + this.$api.URL_LOGIN;
        const requestBody = {
          username: this.input.username,
          password: this.input.password
        };
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        axios.post(url, qs.stringify(requestBody), config)
          .then((result) => {
            if(result.status === 200) {
              sessionStorage.setItem('token', result.data); // store the JWT in session storage
              // Set authorization headers for axios and jQuery
              axios.defaults.headers.common['Authorization'] = `Bearer ${result.data}`;
              $.ajaxSetup({
                beforeSend: function(xhr) {
                  xhr.setRequestHeader("Authorization", `Bearer ${result.data}`);
                }
              });
              this.$router.replace({ name: "Dashboard" });
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              if (err.response.data === this.$api.FORCE_PASSWORD_CHANGE) {
                this.$router.replace({ name: "PasswordForceChange" });
                return;
              }
              this.$bvModal.show('modal-informational');
              this.loginError = this.$t('message.login_unauthorized');
            } else if (err.response.status === 403) {
              this.$bvModal.show('modal-informational');
              this.loginError = this.$t('message.login_forbidden');
            }
          })
      }
    }
  }
</script>
