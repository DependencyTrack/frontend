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
import { decodeToken, getToken } from '../shared/permissions';
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
      identityProvider: decodeToken(getToken()).idp,
    };
  },
  computed: {
    user() {
      return this.currentUser.fullname || this.currentUser.username;
    },
  },
  methods: {
    logout: function () {
      // Instructs all tabs (via localStorage event) that the session is being invalidated
      localStorage.setItem('sessionInvalidate', Date.now().toLocaleString());
      localStorage.removeItem('sessionInvalidate');
      // Removes the token from session storage and reload
      EventBus.$emit('authenticated', null);
      this.$router.replace({ name: 'Login' });
    },
    canChangePassword: function () {
      return this.identityProvider == 'LOCAL';
    },
    canUpdateProfile: function () {
      return this.identityProvider == 'LOCAL';
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
