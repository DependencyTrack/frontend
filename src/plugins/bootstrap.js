import 'bootstrap-table/dist/bootstrap-table.min.css';

import './jquery.js';
import 'bootstrap';
import 'jquery-treegrid/js/jquery.treegrid.min.js';
import 'bootstrap-table/dist/bootstrap-table.js';
import 'bootstrap-table/dist/extensions/treegrid/bootstrap-table-treegrid.min.js';
import 'bootstrap-table/dist/extensions/defer-url/bootstrap-table-defer-url.js';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';
import { VBModal, VBTooltip } from 'bootstrap-vue';

export default function installExtraBootstrapComponentsAndDirectives(Vue) {
  Vue.component('bootstrap-table', BootstrapTable);
  Vue.directive('b-tooltip', VBTooltip);
  Vue.directive('b-modal', VBModal);
}
