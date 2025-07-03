// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Vue from 'vue';
import App from './App';
import router from './router';
import i18n from './i18n';
import './validation';
import axios from 'axios';
import VueAxios from 'vue-axios';
import '@/directives/VuePermission';
import api from './shared/api.json';
import oidc from './shared/oidc.json';
import version from './version';
import { getContextPath } from './shared/utils';
import {
  installBootstrap,
  installBootstrapPageTitlePlugin,
} from '@/plugins/bootstrap';
import installPermissionDirective from '@/directives/VuePermission';

Vue.use(VueAxios, axios);

installBootstrap(Vue);
installBootstrapPageTitlePlugin(Vue, router);
installPermissionDirective(Vue);

Vue.prototype.$api = api;
Vue.prototype.$oidc = oidc;

console.log('Loading DT...');

const contextPath = getContextPath();
axios
  .get(contextPath + '/static/config.json')
  .then((response) => {
    console.log('Loaded config.json', response);
    if (response.data.API_BASE_URL && response.data.API_BASE_URL !== '') {
      Vue.prototype.$api.BASE_URL = response.data.API_BASE_URL;
    } else {
      Vue.prototype.$api.BASE_URL = contextPath;
    }

    // Send XHR cross-site cookie credentials
    Vue.prototype.$api.WITH_CREDENTIALS =
      response.data.API_WITH_CREDENTIALS &&
      response.data.API_WITH_CREDENTIALS.toLowerCase() === 'true';

    // OpenID Connect
    Vue.prototype.$oidc.ISSUER = response.data.OIDC_ISSUER;
    Vue.prototype.$oidc.CLIENT_ID = response.data.OIDC_CLIENT_ID;
    Vue.prototype.$oidc.SCOPE = response.data.OIDC_SCOPE;
    Vue.prototype.$oidc.FLOW = response.data.OIDC_FLOW;
    if (response.data.OIDC_LOGIN_BUTTON_TEXT) {
      Vue.prototype.$oidc.LOGIN_BUTTON_TEXT =
        response.data.OIDC_LOGIN_BUTTON_TEXT;
    } else {
      Vue.prototype.$oidc.LOGIN_BUTTON_TEXT = '';
    }
    createVueApp();
  })
  .catch(function (error) {
    console.log(
      'Cannot retrieve static/config.json from host. This is expected behavior in development environments.',
    );
    createVueApp();
  })
  .catch((error) => {
    console.error('Failed to load config.json', error);
  });

/**
 * Removed finally block due to:
 * https://github.com/DependencyTrack/frontend/issues/34
 */
function createVueApp() {
  console.log('Creating Vue App');
  /*
  Register global $dtrack variable which will be the response body from /api/version.
  $dtrack can then be used anywhere in the app to get information about the server,
  the version of dtrack, timestamp, uuid, Alpine version, etc.
  */
  axios
    .get(`${Vue.prototype.$api.BASE_URL}/${Vue.prototype.$api.URL_ABOUT}`)
    .then((result) => {
      Vue.prototype.$dtrack = result.data;
    })
    .catch((error) => {
      console.error('Failed to load about URL', error);
    });

  Vue.prototype.$version = version;

  new Vue({
    el: '#app',
    router,
    components: {
      App,
    },
    template: '<App/>',
    i18n,
  });
}
