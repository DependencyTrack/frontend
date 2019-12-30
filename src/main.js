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
import VueLodash from 'vue-lodash'
import VueShowdown from 'vue-showdown'
import '@/directives/VuePermission'
import VueToastr from "vue-toastr";
import api from "./shared/api";

Vue.use(BootstrapVue);
Vue.use(VueAxios, axios);
Vue.use(VueLodash, { name: 'lodash' });
Vue.use(VueToastr, {
  defaultTimeout: 5000,
  defaultProgressBar: false,
  defaultProgressBarValue: 0,
  defaultPosition: "toast-top-right",
  defaultCloseOnHover: false
});
Vue.use(VueShowdown, { flavor: 'github' });

/*
Register global $dtrack variable which will be the response body from /api/version.
$dtrack can then be used anywhere in the app to get information about the server,
the version of dtrack, timestamp, uuid, Alpine version, etc.
 */
Vue.prototype.$dtrack = {};
axios.get(`${api.BASE_URL}/${api.URL_ABOUT}`)
  .then((result) => {
    Vue.prototype.$dtrack = result.data;
  }
);

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App,
  }
  ,i18n
});
