<template>
  <router-view></router-view>
</template>

<script>
// bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
import $ from 'jquery';
import { getUrlVar } from './shared/utils';
import { getToken } from './shared/permissions';
import EventBus from './shared/eventbus';
import VueRouter from 'vue-router';

export default {
  name: 'app',
  created() {
    const setJwtForAjax = (jwt) => {
      if (jwt) {
        $.ajaxSettings.headers['Authorization'] =
          this.axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      } else {
        delete this.axios.defaults.headers.common['Authorization'];
        delete $.ajaxSettings.headers['Authorization'];
      }
    };

    EventBus.$on('authenticated', (jwt) => {
      if (jwt) {
        sessionStorage.setItem('token', jwt);
      } else {
        sessionStorage.removeItem('token');
      }
      setJwtForAjax(jwt);
    });

    // ensure $.ajaxSettings.headers exists
    $.ajaxSetup({
      headers: {},
    });

    setJwtForAjax(getToken());

    // Send XHR cross-site cookie credentials
    if (this.$api.WITH_CREDENTIALS) {
      this.axios.interceptors.request.use(function (config) {
        config.withCredentials = true;
        return config;
      });
      $.ajaxSettings.xhrFields = { withCredentials: true };
    }

    // debug logging of ajax requests/responses
    if (getUrlVar('debug')) {
      $(document).ajaxComplete((event, xhr) => {
        console.debug(
          'jQuery-Status:',
          xhr.status,
          'jQuery-Response',
          xhr.responseJSON || xhr.responseText,
        );
      });
      // Intercept all HTTP requests
      this.axios.interceptors.request.use((request) => {
        console.debug('Request', request);
        return request;
      });
      // Intercept all HTTP responses
      this.axios.interceptors.response.use((response) => {
        console.debug('Response', response);
        return response;
      });
    }

    this.axios.interceptors.response.use(null, (error) => {
      // On error status codes (4xx - 5xx), display a toast with the HTTP status code and text.
      if (error.response.status >= 400 && error.response.status < 500) {
        this.$toastr.e(
          error.response.statusText + ' (' + error.response.status + ')',
          this.$t('condition.http_request_error'),
        );
      } else {
        this.$toastr.e(
          error.response.statusText + ' (' + error.response.status + ')',
          this.$t('condition.server_error'),
        );
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
    window.addEventListener('click', (event) => {
      // ensure we use the link, in case the click has been received by a subelement
      let { target } = event;
      while (target && target.tagName !== 'A') target = target.parentNode;
      // handle only links that do not reference external resources
      if (target && target.matches("a:not([href*='://'])") && target.href) {
        // some sanity checks taken from vue-router:
        // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
        const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } =
          event;
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
          this.$router.push(to + url.search).catch((e) => {
            const { isNavigationFailure, NavigationFailureType } = VueRouter;
            // inform about navigation errors but ignore redirect errors that may be caused by the navigation guard when redirecting to the login page
            if (!isNavigationFailure(e, NavigationFailureType.redirected)) {
              this.$toastr.e(this.$t('404.message'), this.$t('404.heading'));
              console.error(e);
            }
          });
        }
      }
    });
  },
};
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
