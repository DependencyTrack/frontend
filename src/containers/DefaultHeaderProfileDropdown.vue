<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <i class="fa fa-user-circle-o" style="font-size:1.6em;"></i>
    </template>
    <template slot="dropdown">
      <b-dropdown-header
        boundary="viewport"
        tag="div"
        class="text-center">
        <strong>{{ $t('message.profile') }}</strong>
      </b-dropdown-header>
      <b-dropdown-item v-b-modal.profileEditModal><i class="fa fa-user text-primary" /> {{ $t('message.profile_update') }}</b-dropdown-item>
      <b-dropdown-item :to="{name: 'PasswordForceChange'}"><i class="fa fa-key text-primary" /> {{ $t('message.change_password') }}</b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item @click="logout"><i class="fa fa-sign-out text-primary" /> {{ $t('message.logout') }}</b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
  import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
  import EventBus from '../shared/eventbus';

  export default {
    name: 'DefaultHeaderProfileDropdown',
    components: {
      AppHeaderDropdown
    },
    data: () => {
      return { itemsCount: 42 }
    },
    methods: {
      logout: function () {
        // Instructs all tabs (via localStorage event) that the session is being invalidated
        localStorage.setItem("sessionInvalidate", Date.now().toLocaleString());
        localStorage.removeItem("sessionInvalidate");
        // Removes the token from session storage and reload
        EventBus.$emit('authenticated', null);
        this.$router.replace({ name: "Login" });
      }
    }
  }
</script>

<style>
  .app-header .navbar-nav .dropdown-menu-right {
    right: inherit;
  }
</style>
