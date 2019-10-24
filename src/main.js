// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js/es6/promise'
import 'core-js/es6/string'
import 'core-js/es7/array'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import Messages from './i18n/messages.json'
import './plugins/table.js'

Vue.use(BootstrapVue);
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: Messages
});

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
  ,i18n
});
