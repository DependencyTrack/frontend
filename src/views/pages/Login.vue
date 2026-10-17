<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card v-if="isWelcomeMessage" no-body class="p-4 m-0">
            <div>
              <p><span v-html="welcomeMessage" /></p>
            </div>
          </b-card>
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form @submit.prevent.stop="login">
                  <h1>{{ $t('message.login') }}</h1>
                  <p class="text-muted">{{ $t('message.login_desc') }}</p>
                  <b-validated-input-group-form-input
                    id="username"
                    :label="$t('message.username')"
                    input-group-size="mb-3"
                    required
                    mode="passive"
                    icon="fa-solid fa-user"
                    type="text"
                    autocomplete="username email"
                    v-model="input.username"
                    autofocus="true"
                    lazy="true"
                    v-show="showLoginForm"
                  />
                  <b-validated-input-group-form-input
                    name="password"
                    :label="$t('message.password')"
                    input-group-size="mb-3"
                    required
                    mode="passive"
                    icon="fa-solid fa-lock"
                    type="password"
                    autcomplete="currentpassword"
                    v-model="input.password"
                    lazy="true"
                    v-show="showLoginForm"
                  />
                  <b-row style="margin-bottom: 1rem">
                    <b-col cols="6" v-show="showLoginForm">
                      <b-button variant="primary" type="submit" class="px-4">{{
                        $t('message.login')
                      }}</b-button>
                    </b-col>
                    <b-col cols="6" v-show="oidcAvailable">
                      <b-button
                        :style="{ float: showLoginForm ? 'right' : 'none' }"
                        v-on:click="oidcLogin()"
                      >
                        <span v-if="oidcCheckLoginButtonTextSetted()">{{
                          oidcLoginButtonText()
                        }}</span>
                        <img
                          alt="OpenID Logo"
                          src="@/assets/img/openid-logo.svg"
                          width="60px"
                          v-else
                        />
                      </b-button>
                    </b-col>
                  </b-row>
                  <b-link
                    v-show="oidcAvailable && !showLoginForm"
                    v-on:click="showLoginForm = true"
                    >{{ $t('message.login_more_options') }}</b-link
                  >
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="py-5 d-none d-lg-flex" style="width: 44%">
              <b-card-body class="text-center">
                <div>
                  <img
                    class="logo-dark-theme"
                    src="@/assets/img/brand/dt-logo-vertical-white-text.svg"
                    width="100%"
                  />
                  <img
                    class="logo-light-theme"
                    src="@/assets/img/brand/dt-logo-vertical-dark-text.svg"
                    width="100%"
                  />
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
    <informational-modal
      v-model="showInformationalModal"
      v-bind:message="loginError"
    />
  </div>
</template>

<script>
import axios from 'axios';
// bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput.vue';
import InformationalModal from '../modals/InformationalModal.vue';
import EventBus from '../../shared/eventbus';
import { getRedirectUrl, getContextPath } from '../../shared/utils';
import common from '../../shared/common';
import * as permissions from '../../shared/permissions';
import DOMPurify from 'dompurify';

export default {
  name: 'Login',
  components: {
    InformationalModal,
    BValidatedInputGroupFormInput,
  },
  data() {
    return {
      showInformationalModal: false,
      isWelcomeMessage: true,
      welcomeMessage: '',
      loginError: '',
      input: {
        username: '',
        password: '',
      },
      oidcAvailable: false,
      oidcUserManager: null,
      showLoginForm: false,
    };
  },
  beforeMount() {
    let enabled_url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/welcome.message.enabled`;
    axios
      .get(enabled_url)
      .then((response) => {
        this.isWelcomeMessage = common.toBoolean(response.data.propertyValue);
      })
      .then(() => {
        if (this.isWelcomeMessage) {
          let message_url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/welcome.message.html`;
          axios.get(message_url).then((response) => {
            this.welcomeMessage = DOMPurify.sanitize(
              decodeURIComponent(response.data.propertyValue),
            );
          });
        }
      });
  },
  methods: {
    login() {
      const url = this.$api.BASE_URL + '/' + this.$api.URL_LOGIN;
      const requestBody = {
        username: this.input.username,
        password: this.input.password,
      };
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      // redirect to url from query param but only if it is save for redirection
      const redirectTo = getRedirectUrl(this.$router);
      axios
        .post(url, new URLSearchParams(requestBody), config)
        .then((result) => {
          if (result.status === 200) {
            return this.fetchAndCheckPermissions(result.data, redirectTo);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            if (err.response.data === this.$api.FORCE_PASSWORD_CHANGE) {
              this.$router.replace({
                name: 'PasswordForceChange',
                query: { redirect: redirectTo },
              });
              return;
            }
            this.showInformationalModal = true;
            this.loginError = this.$t('message.login_unauthorized');
          } else if (err.response.status === 403) {
            this.showInformationalModal = true;
            this.loginError = this.$t('message.login_forbidden');
          }
        });
    },
    fetchAndCheckPermissions(token, redirectTo) {
      const permUrl =
        this.$api.BASE_URL + '/' + this.$api.URL_USER_SELF_PERMISSIONS;
      return axios
        .get(permUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then((result) => {
          if (!Array.isArray(result.data)) {
            throw new Error(
              `Unexpected permissions response: ${JSON.stringify(result.data)}`,
            );
          }
          if (result.data.includes(permissions.VIEW_PORTFOLIO)) {
            permissions.storePermissions(result.data);
            EventBus.emit('authenticated', token);
            redirectTo
              ? this.$router.replace(redirectTo)
              : this.$router.replace({ name: 'Dashboard' });
          } else {
            this.showInformationalModal = true;
            this.loginError = this.$t('message.login_permission_required');
          }
        })
        .catch(() => {
          this.showInformationalModal = true;
          this.loginError = this.$t('condition.unsuccessful_action');
        });
    },
    isOidcAvailableInFrontend() {
      return this.$oidc.ISSUER && this.$oidc.CLIENT_ID && this.$oidc.SCOPE;
    },
    checkOidcAvailability() {
      if (!this.isOidcAvailableInFrontend()) {
        return Promise.resolve(false);
      }

      const url = this.$api.BASE_URL + '/' + this.$api.URL_OIDC_AVAILABLE;

      return axios
        .get(url)
        .then((result) => {
          var oidcAvailableInBackend = false;
          if (result.status === 200) {
            oidcAvailableInBackend = result.data === true;
          }
          return oidcAvailableInBackend;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    oidcLogin() {
      this.oidcUserManager
        .signinRedirect({
          state: getRedirectUrl(this.$router),
        })
        .catch((err) => {
          console.log(err);
          this.$toastr.e(this.$t('message.oidc_redirect_failed'));
        });
    },
    oidcCheckLoginButtonTextSetted() {
      return this.$oidc.LOGIN_BUTTON_TEXT.length > 0;
    },
    oidcLoginButtonText() {
      return this.$oidc.LOGIN_BUTTON_TEXT;
    },
    goToLogin() {
      this.isWelcomeMessage = false;
    },
  },
  mounted() {
    if (this.$route.query.error === 'oidc') {
      this.showInformationalModal = true;
      this.loginError = this.$t('message.oidc_login_failed');

      // Show the error the OIDC IdP reported to help users debug failures.
      // NB: Written by oidc-callback.html. NOT using URL params as those
      // can be crafted to inject arbitrary text.
      const details = sessionStorage.getItem('oidc.error');
      sessionStorage.removeItem('oidc.error');
      if (details) {
        this.loginError += ` (${details})`;
      }
    }
    this.checkOidcAvailability()
      .then(async (oidcAvailable) => {
        if (!oidcAvailable) {
          this.showLoginForm = true;
          return;
        }

        const { createOidcClient } = await import('../../shared/oidcClient');
        this.oidcUserManager = createOidcClient({
          issuer: this.$oidc.ISSUER,
          clientId: this.$oidc.CLIENT_ID,
          scope: this.$oidc.SCOPE,
          flow: this.$oidc.FLOW,
          redirectUri: `${window.location.origin}${getContextPath()}/static/oidc-callback.html`,
        });
        this.oidcAvailable = true;

        this.oidcUserManager.getUser().then((oidcUser) => {
          // oidcUser will only be set when coming from oidc-callback.html
          if (oidcUser === null) {
            return;
          }

          // Exchange OAuth2 Access Token for a session token issued by Dependency-Track
          const url = this.$api.BASE_URL + '/' + this.$api.URL_USER_OIDC_LOGIN;
          const requestBody = {
            accessToken: oidcUser.access_token,
            idToken: oidcUser.id_token,
          };
          const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          this.axios
            .post(url, new URLSearchParams(requestBody), config)
            .then((result) => {
              if (result.status === 200) {
                const redirectTo = getRedirectUrl(this.$router);
                return this.fetchAndCheckPermissions(result.data, redirectTo);
              }
            })
            .catch((err) => {
              if (err.response.status === 401) {
                this.showInformationalModal = true;
                this.loginError = this.$t('message.login_unauthorized');
              } else if (err.response.status === 403) {
                this.showInformationalModal = true;
                this.loginError = this.$t('message.login_forbidden');
              }
            })
            .finally(() => {
              this.oidcUserManager.removeUser();
            });
        });
      })
      .catch(() => {
        // automatic fallback to login form when oidc availability check failed
        this.showLoginForm = true;
        this.$toastr.e(this.$t('message.oidc_availability_check_failed'));
      });
  },
};
</script>
