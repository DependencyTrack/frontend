<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <i class="fa fa-user-circle-o" style="font-size: 1.6em"></i>
    </template>
    <template slot="dropdown">
      <b-dropdown-header boundary="viewport" tag="div" class="text-center">
        {{ $t('message.connected_as') }}
        <strong>{{ user }}</strong>
      </b-dropdown-header>
      <b-dropdown-item v-if="canUpdateProfile()" v-b-modal.profileEditModal
        ><i class="fa fa-user text-primary" />
        {{ $t('message.profile_update') }}</b-dropdown-item
      >
      <b-dropdown-item v-if="canChangePassword()" to="/change-password"
        ><i class="fa fa-key text-primary" />
        {{ $t('message.change_password') }}</b-dropdown-item
      >
      <b-dropdown-divider v-if="canUpdateProfile() || canChangePassword()" />
      <b-dropdown-form id="locale-picker-form" class="pl-2 pr-2">
        <LocalePicker />
      </b-dropdown-form>
      <b-dropdown-divider />
      <b-dropdown-item @click="logout"
        ><i class="fa fa-sign-out text-primary" />
        {{ $t('message.logout') }}</b-dropdown-item
      >
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue';
import EventBus from '../shared/eventbus';
import { clearOidcSession, getOidcUserManager } from '../shared/oidc';
import globalVarsMixin from '../mixins/globalVarsMixin';
import LocalePicker from '@/views/components/LocalePicker.vue';

export default {
  name: 'DefaultHeaderProfileDropdown',
  mixins: [globalVarsMixin],
  components: {
    AppHeaderDropdown,
    LocalePicker,
  },
  data: () => {
    return {
      itemsCount: 42,
    };
  },
  computed: {
    user() {
      return this.currentUser.fullname || this.currentUser.username;
    },
    isManagedUser() {
      return (
        this.currentUser &&
        Object.prototype.hasOwnProperty.call(this.currentUser, 'suspended')
      );
    },
  },
  methods: {
    logout: function () {
      const url = this.$api.BASE_URL + '/' + this.$api.URL_USER_LOGOUT;
      this.axios.post(url).finally(() => {
        // Instructs all tabs (via localStorage event) that the session is being invalidated
        localStorage.setItem('sessionInvalidate', Date.now().toLocaleString());
        localStorage.removeItem('sessionInvalidate');
        // Clear token and permissions.
        EventBus.$emit('authenticated', null);

        const idToken = clearOidcSession();
        const oidcUserManager = idToken === null ? null : getOidcUserManager();
        if (oidcUserManager === null) {
          // Not an OIDC session, or OIDC is no longer configured.
          this.$router.replace({ name: 'Login' });
          return;
        }

        // RP-Initiated Logout, see
        // https://openid.net/specs/openid-connect-rpinitiated-1_0.html
        // Without it the session at the identity provider survives, and the
        // next click on the OpenID button re-authenticates silently.
        oidcUserManager
          .signoutRedirect({ id_token_hint: idToken || undefined })
          .catch(() => {
            this.$router.replace({ name: 'Login' });
          });
      });
    },
    canChangePassword: function () {
      return this.isManagedUser;
    },
    canUpdateProfile: function () {
      return this.isManagedUser;
    },
  },
};
</script>

<style>
.app-header .navbar-nav .dropdown-menu-right {
  right: inherit;
}

/* Remove default padding inherited from b-dropdown-form. */
#locale-picker-form {
  padding: 0;
}
</style>
