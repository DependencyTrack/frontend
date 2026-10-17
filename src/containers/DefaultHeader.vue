<template>
  <header class="app-header navbar d-lg-none">
    <button
      class="navbar-toggler"
      type="button"
      @click.stop="toggleSidebar('sidebar-show')"
    >
      <span class="navbar-toggler-icon" />
    </button>
  </header>
</template>
<script>
export default {
  name: 'DefaultHeader',
  methods: {
    toggleSidebar(cssClass) {
      document.body.classList.toggle(cssClass);
    },
  },
};
</script>
