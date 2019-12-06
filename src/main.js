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
import '@/directives/VuePermission'

Vue.use(BootstrapVue);
Vue.use(VueAxios, axios);
Vue.use(VueLodash, { name: 'lodash' });

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App,
  }
  ,i18n
});
