import 'bootstrap-table/dist/bootstrap-table.min.css';

import './jquery.js';
import 'bootstrap';
import 'jquery-treegrid/js/jquery.treegrid.min.js';
import 'bootstrap-table/dist/bootstrap-table.js';
import 'bootstrap-table/dist/extensions/treegrid/bootstrap-table-treegrid.min.js';
import 'bootstrap-table/dist/extensions/defer-url/bootstrap-table-defer-url.js';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';
import { BootstrapVue } from 'bootstrap-vue';
import VueToastr from 'vue-toastr';
import vueDebounce from 'vue-debounce';
import VuePageTitle from 'vue-page-title';

export function installBootstrap(vue) {
  vue.use(BootstrapVue);
  vue.use(VueToastr, {
    defaultTimeout: 5000,
    defaultProgressBar: false,
    defaultProgressBarValue: 0,
    defaultPosition: 'toast-top-right',
    defaultCloseOnHover: false,
  });
  vue.use(vueDebounce, { defaultTime: '750ms' });
  vue.component('bootstrap-table', BootstrapTable);
}

export function installBootstrapPageTitlePlugin(vue, router) {
  vue.use(VuePageTitle, { prefix: 'Dependency-Track -', router });
}
