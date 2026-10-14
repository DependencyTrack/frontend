<template>
  <header class="app-header navbar">
    <button
      class="navbar-toggler d-lg-none"
      type="button"
      @click.stop="toggleSidebar('sidebar-show')"
    >
      <span class="navbar-toggler-icon" />
    </button>
    <img
      class="d-none d-lg-inline"
      style="margin-left: 10px"
      src="@/assets/img/brand/dt-logo-symbol.svg"
      width="30"
      height="30"
      alt="Dependency-Track Logo"
    />
    <button
      class="navbar-toggler d-none d-lg-inline-block"
      type="button"
      @click.stop="toggleSidebar('sidebar-lg-show')"
    >
      <span class="navbar-toggler-icon" />
    </button>
    <b-navbar-nav class="ms-auto">
      <DefaultHeaderProfileDropdown
        @editProfile="showProfileEditModal = true"
      />
    </b-navbar-nav>
    <profile-edit-modal v-model="showProfileEditModal" />
  </header>
</template>
<script>
import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown.vue';
import ProfileEditModal from '../views/components/ProfileEditModal.vue';

export default {
  name: 'DefaultHeader',
  components: {
    DefaultHeaderProfileDropdown,
    ProfileEditModal,
  },
  data() {
    return {
      showProfileEditModal: false,
    };
  },
  methods: {
    toggleSidebar(cssClass) {
      document.body.classList.toggle(cssClass);
    },
  },
};
</script>
