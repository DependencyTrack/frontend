<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <i class="fa fa-user-circle-o fa-2x"></i>
    </template>
    <template slot="dropdown">
      <b-dropdown-header
        tag="div"
        class="text-center">
        <strong>Settings</strong>
      </b-dropdown-header>
      <b-dropdown-item><i class="fa fa-user text-primary" /> Profile</b-dropdown-item>
      <b-dropdown-item><i class="fa fa-wrench text-primary" /> Settings</b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item @click="logout"><i class="fa fa-sign-out text-primary" /> Logout</b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
  import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
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
        sessionStorage.removeItem('token');
        this.$router.replace({ name: "Login" });
      }
    }
  }
</script>
