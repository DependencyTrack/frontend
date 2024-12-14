import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import axios from 'axios';
import VueAxios from 'vue-axios';
import vueDebounce from 'vue-debounce';
import './validation';
import api from './shared/api.json';
import oidc from './shared/oidc.json';
import version from './version';
import { getContextPath } from './shared/utils';
import { VueToastr } from 'vue-toastr';
import { createBootstrap } from 'bootstrap-vue-next';
import { BTooltip } from 'bootstrap-vue-next';

import './assets/scss/style.scss';

const app = createApp(App);

app.config.globalProperties.$api = api;
app.config.globalProperties.$oidc = oidc;

const contextPath = getContextPath();
axios
  .get(contextPath + '/static/config.json')
  .then((response) => {
    if (response.data.API_BASE_URL && response.data.API_BASE_URL !== '') {
      app.config.globalProperties.$api.BASE_URL = response.data.API_BASE_URL;
    } else {
      app.config.globalProperties.$api.BASE_URL = contextPath;
    }

    // Send XHR cross-site cookie credentials
    app.config.globalProperties.$api.WITH_CREDENTIALS =
      response.data.API_WITH_CREDENTIALS &&
      response.data.API_WITH_CREDENTIALS.toLowerCase() === 'true';

    // OpenID Connect
    app.config.globalProperties.$oidc.ISSUER = response.data.OIDC_ISSUER;
    app.config.globalProperties.$oidc.CLIENT_ID = response.data.OIDC_CLIENT_ID;
    app.config.globalProperties.$oidc.SCOPE = response.data.OIDC_SCOPE;
    app.config.globalProperties.$oidc.FLOW = response.data.OIDC_FLOW;
    if (response.data.OIDC_LOGIN_BUTTON_TEXT) {
      app.config.globalProperties.$oidc.LOGIN_BUTTON_TEXT =
        response.data.OIDC_LOGIN_BUTTON_TEXT;
    } else {
      app.config.globalProperties.$oidc.LOGIN_BUTTON_TEXT = '';
    }
  })
  .catch(function (error) {
    console.log(
      'Cannot retrieve static/config.json from host. This is expected behavior in development environments.',
    );
  })
  .finally(() => {
    createVueApp();
  })

// For debug purposes
const DirectiveTracker = {
  install(app, options) {
    app.config.globalProperties.$directives = {};

    app.directive = new Proxy(app.directive, {
      apply(target, thisArg, argumentsList) {
        const [name, definition] = argumentsList;
        app.config.globalProperties.$directives[name] = definition;
        return Reflect.apply(...arguments);
      }
    });
  }
};

/**
 * Removed finally block due to:
 * https://github.com/DependencyTrack/frontend/issues/34
 */
function createVueApp() {
  axios
    .get(`${app.config.globalProperties.$api.BASE_URL}/${app.config.globalProperties.$api.URL_ABOUT}`)
    .then((result) => {
      app.config.globalProperties.$dtrack = result.data;
    });

  app.config.globalProperties.$version = version;

  console.log("Dependency Track v" + version.version);

  if (import.meta.env.MODE === 'development') {
    app.use(DirectiveTracker);
  }
  app.use(router);
  app.use(i18n);
  app.use(createBootstrap());
  // For some reason bootstrap doesn't seem to be registering the tooltip? Temporary workaround
  app.directive('b-tooltip', BTooltip);
  app.use(VueToastr, {
    defaultTimeout: 5000,
    defaultProgressBar: false,
    defaultProgressBarValue: 0,
    defaultPosition: 'toast-top-right',
    defaultCloseOnHover: false,
  });
  app.use(VueAxios, axios);
  app.provide('axios', app.config.globalProperties.axios);

  if (import.meta.env.MODE === 'development') {
    console.log("Directives", app.config.globalProperties.$directives);
  }

  app.directive('debounce', vueDebounce({ defaultTime: '750ms' })).mount('#app');
}
