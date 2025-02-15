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
                    <p class="text-muted">
                      {{ $t('message.password_force_change_desc') }}
                    </p>
                    <b-validated-input-group-form-input
                      id="username"
                      :label="$t('message.username')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-user"
                      type="text"
                      autocomplete="username email"
                      v-model="input.username"
                    />
                    <b-validated-input-group-form-input
                      id="current-password"
                      :label="$t('message.password_current')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-lock"
                      type="password"
                      autocomplete="current-password"
                      v-model="input.password"
                    />
                    <b-validated-input-group-form-input
                      id="new-password"
                      :label="$t('message.password_new')"
                      input-group-size="mb-3"
                      rules="required"
                      icon="icon-lock"
                      type="password"
                      autocomplete="off"
                      v-model="input.newPassword"
                    />
                    <b-validated-input-group-form-input
                      id="confirm-password"
                      :label="$t('message.password_confirm')"
                      input-group-size="mb-3"
                      rules="required|confirmed:new-password"
                      icon="icon-lock"
                      type="password"
                      autocomplete="off"
                      v-model="input.confirmPassword"
                    />
                    <b-row>
                      <b-col>
                        <b-button
                          block
                          variant="primary"
                          class="px-4"
                          type="submit"
                          >{{ $t('message.password_change') }}</b-button
                        >
                      </b-col>
                    </b-row>
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
                  />
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
    <InformationalModal v-bind:message="passwordChangeError" />
  </div>
</template>

<script>
import axios from 'axios';
import { ValidationObserver } from 'vee-validate';
import InformationalModal from '../modals/InformationalModal';
import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput';
import { getRedirectUrl } from '@/shared/utils';
import queryString from 'query-string';

export default {
  name: 'PasswordForceChange',
  components: {
    BValidatedInputGroupFormInput,
    InformationalModal,
    ValidationObserver,
  },
  data() {
    return {
      passwordChangeError: '',
      input: {
        username: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  methods: {
    changePassword() {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_FORCE_PW_CHANGE}`;
      const requestBody = {
        username: this.input.username,
        password: this.input.password,
        newPassword: this.input.newPassword,
        confirmPassword: this.input.confirmPassword,
      };
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      axios
        .post(url, queryString.stringify(requestBody), config)
        .then((result) => {
          if (result.status === 200) {
            this.$toastr.s(this.$t('message.password_change_success'));
            // We don't get the JWT token on a successful password change,
            // reroute users back to login
            const redirectTo = getRedirectUrl(this.$router);
            this.$router.replace({
              name: 'Login',
              query: { redirect: redirectTo },
            });
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            this.$bvModal.show('modal-informational');
            this.passwordChangeError = this.$t('message.password_unauthorized');
          } else if (err.response.status === 406) {
            this.$bvModal.show('modal-informational');
            this.passwordChangeError = this.$t(
              'message.password_not_acceptable',
            );
          }
        });
    },
  },
};
</script>
