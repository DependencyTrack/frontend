<template>
  <AppHeader fixed>
    <SidebarToggler class="d-lg-none" display="md" mobile />
    <img
      class="d-lg-inline d-md-none d-sm-none bv-d-xs-down-none"
      style="margin-left: 10px"
      src="@/assets/img/brand/dt-logo-symbol.svg"
      width="30"
      height="30"
      alt="Dependency-Track Logo"
    />
    <SidebarToggler class="d-md-down-none" display="lg" :default-open="true" />
    <b-navbar-nav class="ml-auto">
      <default-header-profile-dropdown />
    </b-navbar-nav>
  </AppHeader>
</template>
<script>
import { Header as AppHeader, SidebarToggler } from '@coreui/vue';
import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown';
import { BNavbarNav } from 'bootstrap-vue';

export default {
  components: {
    AppHeader,
    DefaultHeaderProfileDropdown,
    SidebarToggler,
    BNavbarNav,
  },
};
</script>
