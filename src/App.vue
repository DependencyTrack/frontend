<template>
  <router-view @authenticated="setAuthenticated"></router-view>
</template>

<script>
  // bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
  import $ from 'jquery';
  export default {
    name: 'app',
    data() {
      return {
        authenticated: false,
      }
    },
    mounted() {
      if(!this.authenticated) {
        this.$router.replace({ name: "Login" });
      }
      $.ajaxSetup({
        beforeSend: function(xhr) {
          let jwt = sessionStorage.getItem('token');
          if (jwt !== null) {
            xhr.setRequestHeader("Authorization", "Bearer " + jwt);
          }
        }
      });
    },
    methods: {
      setAuthenticated(status) {
        this.authenticated = status;
      },
      logout() {
        this.authenticated = false;
      }
    }
  }
</script>

<style lang="scss">
  @import '~@coreui/icons/css/coreui-icons.min.css';
  $fa-font-path: '~font-awesome/fonts/';
  @import '~font-awesome/scss/font-awesome.scss';
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  @import 'assets/scss/style';
</style>
