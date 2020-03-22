// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js/es6/promise'
import 'core-js/es6/string'
import 'core-js/es7/array'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import i18n from './i18n'
import './validation'
import './plugins/table.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueShowdown from 'vue-showdown'
import vueDebounce from 'vue-debounce'
import '@/directives/VuePermission'
import VueToastr from "vue-toastr";
import api from "./shared/api.json";
import oidc from "./shared/oidc.json";
import version from "./version";

Vue.use(BootstrapVue);
Vue.use(VueAxios, axios);
Vue.use(VueToastr, {
  defaultTimeout: 5000,
  defaultProgressBar: false,
  defaultProgressBarValue: 0,
  defaultPosition: "toast-top-right",
  defaultCloseOnHover: false
});
Vue.use(VueShowdown, { flavor: 'github' });
Vue.use(vueDebounce, { defaultTime: '750ms' });

Vue.prototype.$api = api;
Vue.prototype.$oidc = oidc;
axios.get("static/config.json").then(response => {
  Vue.prototype.$api.BASE_URL = response.data.API_BASE_URL;

  // OpenID Connect
  Vue.prototype.$oidc.AUTHORITY = response.data.OIDC_AUTHORITY;
  Vue.prototype.$oidc.CLIENT_ID = response.data.OIDC_CLIENT_ID;
}).catch(function (error) {
  console.log("Cannot retrieve static/config.json from host. This is expected behavior in development environments.")
}).finally(function () {
  /*
  Register global $dtrack variable which will be the response body from /api/version.
  $dtrack can then be used anywhere in the app to get information about the server,
  the version of dtrack, timestamp, uuid, Alpine version, etc.
  */
  axios.get(`${Vue.prototype.$api.BASE_URL}/${Vue.prototype.$api.URL_ABOUT}`)
    .then((result) => {
        Vue.prototype.$dtrack = result.data;
      }
    );

  Vue.prototype.$version = version;

  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {
      App,
    }
    ,i18n
  });
});
