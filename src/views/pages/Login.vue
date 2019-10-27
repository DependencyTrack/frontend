<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form @submit.prevent="login()">
                  <h1>{{ $t('message.login') }}</h1>
                  <p class="text-muted">{{ $t('message.login_desc') }}</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend><b-input-group-text><i class="icon-user"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="text" class="form-control" v-model="input.username" :placeholder="this.$t('message.username')" autocomplete="username email" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="password" class="form-control" v-model="input.password" :placeholder="this.$t('message.password')" autocomplete="current-password" />
                  </b-input-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button variant="primary" type="submit" class="px-4" v-on:click="login()">{{ $t('message.login') }}</b-button>
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
    <InformationalModal v-bind:message="loginError"/>
  </div>
</template>

<script>
  import axios from 'axios'
  import api from '../../shared/api';
  import InformationalModal from '../modals/InformationalModal'
  const qs = require('querystring');

  export default {
    name: 'Login',
    components: {
      InformationalModal
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
        const url = api.BASE_URL + "/" + api.URL_LOGIN;
        console.log(url);
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
            if(result.statusText === 'OK') {
              sessionStorage.setItem('token', result.data); // store the JWT in session storage
              this.$router.replace({ name: "Dashboard" });
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
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
