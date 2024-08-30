import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import axios from 'axios'
import VueAxios from 'vue-axios'
import vueDebounce from 'vue-debounce'
import './validation';
import './plugins/table.js';
import api from './shared/api.json';
import oidc from './shared/oidc.json';
import version from './version';
import { getContextPath } from './shared/utils';
import VueToastr from 'vue-toastr';
import BootstrapVue from 'bootstrap-vue';
import BootstrapTable from 'bootstrap-table';

const app = createApp(App)

app.use(router);
app.use(BootstrapVue);
app.use(i18n);
app.use(VueToastr, {
  defaultTimeout: 5000,
  defaultProgressBar: false,
  defaultProgressBarValue: 0,
  defaultPosition: 'toast-top-right',
  defaultCloseOnHover: false,
});
app.component('BootstrapTable', BootstrapTable);
app.use(VueAxios, axios)
app.provide('axios', app.config.globalProperties.axios)

app.directive('debounce', vueDebounce({ defaultTime: '750ms' }))
  .mount('#app');
