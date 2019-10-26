<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form @submit.prevent="changePassword()">
                  <h1>{{ $t('message.password_force_change') }}</h1>
                  <p class="text-muted">{{ $t('message.password_force_change_desc') }}</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend><b-input-group-text><i class="icon-user"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="text" class="form-control" v-model="input.username" :placeholder="this.$t('message.username')" autocomplete="username email" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="password" class="form-control" v-model="input.password" :placeholder="this.$t('message.password_current')" autocomplete="current-password" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="password" class="form-control" v-model="input.newPassword" :placeholder="this.$t('message.password_new')" autocomplete="off" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="password" class="form-control" v-model="input.confirmPassword" :placeholder="this.$t('message.password_confirm')" autocomplete="off" />
                  </b-input-group>
                  <b-row>
                    <b-col>
                      <b-button block variant="primary" class="px-4" type="submit">{{ $t('message.password_change') }}</b-button>
                    </b-col>
                  </b-row>
                </b-form>
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
  import api from '../../shared/api';
  import InformationalModal from '../modals/InformationalModal'
  const qs = require('querystring');

  export default {
    name: 'PasswordForceChange',
    components: {
      InformationalModal
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
              this.$bvToast.toast(this.$t('message.password_change_success'));
              // We don't get the JWT token on a successfull password change,
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