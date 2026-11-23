import 'bootstrap-table/dist/bootstrap-table.min.css';

import './jquery.js';
import $ from 'jquery';
import Dropdown from 'bootstrap/js/src/dropdown.js';
import 'bootstrap/js/src/tooltip.js';
import EventHandler from 'bootstrap/js/src/dom/event-handler.js';
import 'jquery-treegrid/js/jquery.treegrid.min.js';
import 'bootstrap-table/dist/bootstrap-table.js';
import 'bootstrap-table/dist/extensions/treegrid/bootstrap-table-treegrid.min.js';
import 'bootstrap-table/dist/extensions/defer-url/bootstrap-table-defer-url.js';
import BootstrapTable from 'bootstrap-table/dist/bootstrap-table-vue.js';
import { handleTableLoadError } from '@/shared/utils';
import xssFilters from 'xss-filters';

// Bootstrap's key handler throws on BootstrapVueNext's menus, which have no Bootstrap toggle.
EventHandler.off(
  document,
  'keydown.bs.dropdown.data-api',
  '.dropdown-menu',
  Dropdown.dataApiKeydownHandler,
);
EventHandler.on(
  document,
  'keydown.bs.dropdown.data-api',
  '.dropdown-menu',
  function (event) {
    if (this.parentNode.querySelector('[data-bs-toggle="dropdown"]')) {
      Dropdown.dataApiKeydownHandler.call(this, event);
    }
  },
);

$.fn.bootstrapTable.defaults.iconsPrefix = 'fa';
$.fn.bootstrapTable.defaults.buttonsClass = 'outline-secondary';

$.fn.bootstrapTable.defaults.onLoadError = function (_status, jqXHR) {
  handleTableLoadError(jqXHR && jqXHR.responseJSON);
};

const formatShowingRows = $.fn.bootstrapTable.defaults.formatShowingRows;
$.fn.bootstrapTable.defaults.formatShowingRows = function (
  pageFrom,
  pageTo,
  totalRows,
  totalNotFiltered,
) {
  // NB: `this` is the table's options object. applyTotalCountHeaders sets
  // `boundedTotal` there. It stays unset for every table whose endpoint
  // does not send X-Total-Count-Type.
  let shown = totalRows;
  if (this.boundedTotal) {
    shown = `${this.boundedTotal}+`;
    if (this.boundedTotalTitle) {
      const title = xssFilters.inDoubleQuotedAttr(this.boundedTotalTitle);
      shown = `<span title="${title}">${shown}</span>`;
    }
  }
  return formatShowingRows.call(
    this,
    pageFrom,
    pageTo,
    shown,
    totalNotFiltered,
  );
};

export default BootstrapTable;
