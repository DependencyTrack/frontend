<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card v-if="isWelcomeMessage" no-body class="bg-grey-900 p-4 m-0">
            <div>
              <p><span v-html="welcomeMessage" /></p>
            </div>
          </b-card>
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
                      mode="passive"
                      icon="icon-user"
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
                      rules="required"
                      mode="passive"
                      icon="icon-lock"
                      type="password"
                      autcomplete="currentpassword"
                      v-model="input.password"
                      lazy="true"
                      v-show="showLoginForm"
                    />
                    <b-row style="margin-bottom: 1rem">
                      <b-col cols="6" v-show="showLoginForm">
                        <b-button variant="primary" type="submit" class="px-4"
                          >{{ $t('message.login') }}
                        </b-button>
                      </b-col>
                      <b-col cols="6" v-show="oidcAvailable">
                        <b-button
                          :style="{ float: showLoginForm ? 'right' : 'none' }"
                          @click="oidcLogin()"
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
                      @click="showLoginForm = true"
                      >{{ $t('message.login_more_options') }}
                    </b-link>
                  </b-form>
                </validation-observer>
              </b-card-body>
            </b-card>
            <b-card
              no-body
              class="text-white bg-grey-900 py-5 d-md-down-none"
              style="width: 44%"
            >
              <b-card-body class="text-center">
                <div>
                  <img
                    src="@/assets/img/brand/dt-logo-vertical-white-text.svg"
                    width="100%"
                    alt="DependencyTrack Logo"
                  />
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
    <informational-modal :message="loginError" />
  </div>
</template>

<script>
import Oidc from 'oidc-client';
import { ValidationObserver } from 'vee-validate';
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import InformationalModal from '@/views/modals/InformationalModal';
import EventBus from '@/shared/eventbus';
import { getContextPath, getRedirectUrl } from '@/shared/utils';
import queryString from 'query-string';
import common from '@/shared/common';
import {
  BButton,
  BCard,
  BCardBody,
  BCardGroup,
  BCol,
  BForm,
  BLink,
  BRow,
} from 'bootstrap-vue';

export default {
  components: {
    InformationalModal,
    BValidatedInputGroupFormInput,
    ValidationObserver,
    BRow,
    BCol,
    BCard,
    BCardGroup,
    BCardBody,
    BForm,
    BButton,
    BLink,
  },
  data() {
    return {
      isWelcomeMessage: true,
      welcomeMessage: '',
      loginError: '',
      input: {
        username: '',
        password: '',
      },
      oidcAvailable: false,
      oidcUserManager: new Oidc.UserManager({
        userStore: new Oidc.WebStorageStateStore(),
        authority: this.$oidc.ISSUER,
        client_id: this.$oidc.CLIENT_ID,
        redirect_uri:
          getContextPath() !== ''
            ? `${window.location.origin}${getContextPath()}/static/oidc-callback.html`
            : `${window.location.origin}/static/oidc-callback.html`,
        response_type:
          this.$oidc.FLOW === 'implicit' ? 'token id_token' : 'code',
        scope: this.$oidc.SCOPE,
        loadUserInfo: false,
      }),
      showLoginForm: false,
    };
  },
  beforeMount() {
    let enabled_url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/welcome.message.enabled`;
    this.axios
      .get(enabled_url)
      .then((response) => {
        this.isWelcomeMessage = common.toBoolean(response.data.propertyValue);
      })
      .then(() => {
        if (this.isWelcomeMessage) {
          let message_url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/welcome.message.html`;
          this.axios.get(message_url).then((response) => {
            this.welcomeMessage = decodeURIComponent(
              response.data.propertyValue,
            );
          });
        }
      });
  },
  mounted() {
    this.checkOidcAvailability()
      .then((oidcAvailable) => {
        this.oidcAvailable = oidcAvailable;
        this.showLoginForm = !oidcAvailable;

        if (!oidcAvailable) {
          return;
        }

        this.oidcUserManager.getUser().then((oidcUser) => {
          // oidcUser will only be set when coming from oidc-callback.html
          if (oidcUser === null) {
            return;
          }

          // Exchange OAuth2 Access Token for a JWT issued by Dependency-Track
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
            .post(url, queryString.stringify(requestBody), config)
            .then((result) => {
              if (result.status === 200) {
                EventBus.$emit('authenticated', result.data);
                // redirect to url from query param but only if it is save for redirection
                const redirectTo = getRedirectUrl(this.$router);
                redirectTo
                  ? this.$router.replace(redirectTo)
                  : this.$router.replace({ name: 'Dashboard' });
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
            .finally(() => {
              this.oidcUserManager.removeUser();
            });
        });
      })
      .catch((err) => {
        // automatic fallback to login form when oidc availability check failed
        this.showLoginForm = true;
        this.$toastr.e(this.$t('message.oidc_availability_check_failed'));
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
      this.axios
        .post(url, queryString.stringify(requestBody), config)
        .then((result) => {
          if (result.status === 200) {
            EventBus.$emit('authenticated', result.data);
            redirectTo
              ? this.$router.replace(redirectTo)
              : this.$router.replace({ name: 'Dashboard' });
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
            this.$bvModal.show('modal-informational');
            this.loginError = this.$t('message.login_unauthorized');
          } else if (err.response.status === 403) {
            this.$bvModal.show('modal-informational');
            this.loginError = this.$t('message.login_forbidden');
          }
        });
    },
    isOidcAvailableInFrontend() {
      return (
        this.oidcUserManager.settings.authority &&
        this.oidcUserManager.settings.client_id &&
        this.oidcUserManager.settings.scope
      );
    },
    checkOidcAvailability() {
      if (!this.isOidcAvailableInFrontend()) {
        return Promise.resolve(false);
      }

      const url = this.$api.BASE_URL + '/' + this.$api.URL_OIDC_AVAILABLE;

      return this.axios
        .get(url)
        .then((result) => {
          let oidcAvailableInBackend = false;
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
};
</script>
