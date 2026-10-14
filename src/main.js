import { createApp } from 'vue';
import { createBootstrap } from 'bootstrap-vue-next';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import BootstrapTable from './plugins/table.js';
import axios from 'axios';
import VueAxios from 'vue-axios';
import permission from '@/directives/VuePermission';
import scrollableTabs from '@/directives/ScrollableTabs';
import multiselectLabel from '@/directives/MultiselectLabel';
import '@/views/components/filter-pill-content.css';
import toastr from './plugins/toastr';
import api from './shared/api.json';
import oidc from './shared/oidc.json';
import globals from './shared/globals';
import version from './version.json';
import { getContextPath } from './shared/utils';

globals.$api = api;
globals.$oidc = oidc;
const contextPath = getContextPath();
axios
  .get(contextPath + '/static/config.json')
  .then((response) => {
    if (response.data.API_BASE_URL && response.data.API_BASE_URL !== '') {
      globals.$api.BASE_URL = response.data.API_BASE_URL;
    } else {
      globals.$api.BASE_URL = contextPath;
    }

    // Send XHR cross-site cookie credentials
    globals.$api.WITH_CREDENTIALS =
      response.data.API_WITH_CREDENTIALS &&
      response.data.API_WITH_CREDENTIALS.toLowerCase() === 'true';

    // OpenID Connect
    globals.$oidc.ISSUER = response.data.OIDC_ISSUER;
    globals.$oidc.CLIENT_ID = response.data.OIDC_CLIENT_ID;
    globals.$oidc.SCOPE = response.data.OIDC_SCOPE;
    globals.$oidc.FLOW = response.data.OIDC_FLOW;
    if (response.data.OIDC_LOGIN_BUTTON_TEXT) {
      globals.$oidc.LOGIN_BUTTON_TEXT = response.data.OIDC_LOGIN_BUTTON_TEXT;
    } else {
      globals.$oidc.LOGIN_BUTTON_TEXT = '';
    }

    // Feature flags
    globals.$featureFlags = response.data.FEATURE_FLAGS;
    globals.$isFeatureEnabled = (featureName) => {
      const flags = globals.$featureFlags;
      return (
        flags &&
        Object.prototype.hasOwnProperty.call(flags, featureName) &&
        flags[featureName] === true
      );
    };
    globals.$isAnyFeatureEnabled = (featureNames) => {
      return featureNames.some((name) => globals.$isFeatureEnabled(name));
    };

    createVueApp();
  })
  .catch(function () {
    console.log(
      'Cannot retrieve static/config.json from host. This is expected behavior in development environments.',
    );
    createVueApp();
  });

/**
 * Removed finally block due to:
 * https://github.com/DependencyTrack/frontend/issues/34
 */
function createVueApp() {
  /*
  Register global $dtrack variable which will be the response body from /api/version.
  $dtrack can then be used anywhere in the app to get information about the server,
  the version of dtrack, timestamp, uuid, Alpine version, etc.
  */
  axios
    .get(`${globals.$api.BASE_URL}/${globals.$api.URL_ABOUT}`)
    .then((result) => {
      globals.$dtrack = result.data;
    });

  globals.$version = version;

  const app = createApp(App);
  app.config.globalProperties = Object.assign(
    globals,
    app.config.globalProperties,
  );
  app.use(
    createBootstrap({
      // Except noHeaderClose, BootstrapVue's defaults, which our templates rely on.
      components: {
        BModal: { lazy: true, unmountLazy: true, noHeaderClose: true },
        BFormCheckbox: { uncheckedValue: false },
        BDropdown: { wrapperClass: 'btn-group' },
      },
    }),
  );
  app.use(VueAxios, axios);
  app.use(toastr);
  app.use(router);
  app.use(i18n);
  app.component('BootstrapTable', BootstrapTable);
  app.directive('permission', permission);
  app.directive('scrollable-tabs', scrollableTabs);
  app.directive('multiselect-label', multiselectLabel);
  app.mount('#app');
}
