<template>
  <router-view @authenticated="setAuthenticated"></router-view>
</template>

<script>
  // bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
  import $ from 'jquery';
  import { getUrlVar }  from './shared/utils';

  export default {
    name: 'app',
    data() {
      return {
        authenticated: false,
        user: null,
      }
    },
    created() {
      const jwt = sessionStorage.getItem('token');

      if (jwt === null) {
        this.$router.replace({ name: "Login" });
        return;
      }

      // If JWT was found, assume it is valid and set the authorization headers.
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      $.ajaxSetup({
        beforeSend: function(xhr) {
          if (jwt !== null) {
            xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);
          }
        },
        complete: function(xhr, textStatus) {
          if (getUrlVar("debug")) {
            console.log("Status: " + xhr.status);
            (xhr.responseJSON) ? console.log(xhr.responseJSON) : console.log(xhr.responseText);
          }
        }
      });

      const url = `${this.$api.BASE_URL}/${this.$api.URL_USER_SELF}`;
      this.axios.get(url)
        .then((result) => {
          this.authenticated = true;
          this.user = result.data;
        })
        .catch(() => {
          // The JWT is stale. Unset default headers
          this.axios.defaults.headers.common['Authorization'] = null;
          $.ajaxSetup({
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", null);
            },
            complete: function(xhr, textStatus) {
              if (getUrlVar("debug")) {
                console.log("Status: " + xhr.status);
                (xhr.responseJSON) ? console.log(xhr.responseJSON) : console.log(xhr.responseText);
              }
            }
          });
          // Token is stale, clear stored token and redirect to login view
          sessionStorage.removeItem('token');
          this.$router.replace({ name: "Login" });
        });

      // Intercept all HTTP requests
      this.axios.interceptors.request.use(request => {
        if (this.$route.query.debug) {
          console.log('Request', request);
        }
        return request;
      });

      // Intercept all HTTP responses
      this.axios.interceptors.response.use(response => {
        if (this.$route.query.debug) {
          console.log('Response', response);
        }
        return response;
      }, error => {
        // On error status codes (4xx - 5xx), display a toast with the HTTP status code and text.
        if (error.response.status >= 400 && error.response.status < 500) {
          this.$toastr.e(error.response.statusText + " (" + error.response.status + ")", this.$t('condition.http_request_error'));
        } else {
          this.$toastr.e(error.response.statusText + " (" + error.response.status + ")", this.$t('condition.server_error'));
        }
        return Promise.reject(error);
      });

      /**
       * The Bootstrap-Table Vue component does not support Vue components in custom formatters.
       * Custom formatters are used when modifying the contents of data in a cell, for example,
       * creating a hyperlink to another page. Because Vue components cannot be used in this case,
       * using router-link is not possible. So, we need a way to intercept traditional <a href>
       * and delegate the link to the Vue router. This function provides that.
       *
       * The following code is a slightly modified version derived from:
       * https://dennisreimann.de/articles/delegating-html-links-to-vue-router.html
       */
      window.addEventListener('click', event => {
        // ensure we use the link, in case the click has been received by a subelement
        let { target } = event;
        while (target && target.tagName !== 'A') target = target.parentNode;
        // handle only links that do not reference external resources
        if (target && target.matches("a:not([href*='://'])") && target.href) {
          // some sanity checks taken from vue-router:
          // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
          const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } = event;
          // don't handle with control keys
          if (metaKey || altKey || ctrlKey || shiftKey) return;
          // don't handle when preventDefault called
          if (defaultPrevented) return;
          // don't handle right clicks
          if (button !== undefined && button !== 0) return;
          // don't handle if `target="_blank"`
          if (target && target.getAttribute) {
            const linkTarget = target.getAttribute('target');
            if (/\b_blank\b/i.test(linkTarget)) return;
          }
          // don't handle same page links/anchors
          const url = new URL(target.href);
          const to = url.pathname;
          if (window.location.pathname !== to && event.preventDefault) {
            event.preventDefault();
            this.$router.push(to + url.search);
          }
        }
      })

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
  @import '~@coreui/icons/css/free.min.css';
  $fa-font-path: '~font-awesome/fonts/';
  @import '~font-awesome/scss/font-awesome.scss';
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  @import 'assets/scss/style';
</style>
