import 'bootstrap-table/dist/bootstrap-table.min.css';

import './jquery.js';
import $ from 'jquery';
import Vue from 'vue';
import 'bootstrap';
import 'jquery-treegrid/js/jquery.treegrid.min.js';
import 'bootstrap-table/dist/bootstrap-table.js';
import 'bootstrap-table/dist/extensions/treegrid/bootstrap-table-treegrid.min.js';
import 'bootstrap-table/dist/extensions/defer-url/bootstrap-table-defer-url.js';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.esm.js';
import { handleTableLoadError } from '@/shared/utils';

$.fn.bootstrapTable.defaults.onLoadError = function (status, jqXHR) {
  handleTableLoadError(jqXHR && jqXHR.responseJSON);
};

Vue.component('BootstrapTable', BootstrapTable);
