<template>
  <AppHeaderDropdown right no-caret>
    <template v-slot:header>
      <i class="fa fa-user-circle-o" style="font-size: 1.6em"></i>
    </template>
    <template v-slot:dropdown>
      <b-dropdown-header boundary="viewport" tag="div" class="text-center">
        {{ $t('message.connected_as') }}
        <strong>{{ user }}</strong>
      </b-dropdown-header>
      <b-dropdown-item v-if="canUpdateProfile()" @click="$emit('editProfile')"
        ><i class="fa fa-user text-primary" />
        {{ $t('message.profile_update') }}</b-dropdown-item
      >
      <b-dropdown-item v-if="canChangePassword()" to="/change-password"
        ><i class="fa fa-key text-primary" />
        {{ $t('message.change_password') }}</b-dropdown-item
      >
      <b-dropdown-divider v-if="canUpdateProfile() || canChangePassword()" />
      <b-dropdown-form id="locale-picker-form" class="ps-2 pe-2">
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
        EventBus.emit('authenticated', null);
        this.$router.replace({ name: 'Login' });
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
