import 'bootstrap-table/dist/bootstrap-table.min.css';

import './jquery.js';
import 'bootstrap';
import 'jquery-treegrid/js/jquery.treegrid.min.js';
import 'bootstrap-table/dist/bootstrap-table.js';
import 'bootstrap-table/dist/extensions/treegrid/bootstrap-table-treegrid.min.js';
import 'bootstrap-table/dist/extensions/defer-url/bootstrap-table-defer-url.js';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';

export default function installBootstrapTableComponent(Vue) {
  Vue.component('BootstrapTable', BootstrapTable);
}
