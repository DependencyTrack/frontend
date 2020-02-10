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
      <b-dropdown-item><i class="fa fa-user" /> Profile</b-dropdown-item>
      <b-dropdown-item><i class="fa fa-wrench" /> Settings</b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item @click="logout"><i class="fa fa-lock" /> Logout</b-dropdown-item>
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
        sessionStorage.removeItem('token');
        this.$router.replace({ name: "Login" });
      }
    }
  }
</script>
