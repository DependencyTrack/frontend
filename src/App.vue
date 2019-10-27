<template>
  <router-view @authenticated="setAuthenticated"></router-view>
</template>

<script>
  import axios from 'axios';
  // bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
  import $ from 'jquery';
  import api from './shared/api';
  export default {
    name: 'app',
    data() {
      return {
        authenticated: false,
        user: null,
      }
    },
    mounted() {
      const jwt = sessionStorage.getItem('token');

      if (jwt === null) {
        this.$router.replace({ name: "Login" });
        return;
      }

      const url = `${api.BASE_URL}/${api.URL_USER_SELF}`;
      const config = {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      };

      axios.get(url, config)
        .then((result) => {
          this.authenticated = true;
          this.user = result.data;
          axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`; 
          $.ajaxSetup({
            beforeSend: function(xhr) {
              if (jwt !== null) {
                xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);
              }
            }
          });
        })
        .catch((err) => {
          // Token is stale, clear stored token and redirect to login view
          sessionStorage.removeItem('token');
          this.$router.replace({ name: "Login" });
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
