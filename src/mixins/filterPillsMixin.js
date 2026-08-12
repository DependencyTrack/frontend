import jQuery from 'jquery';
import common from '@/shared/common';

const DATE_ONLY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Lets the URL and the outgoing request share the REST API's vocabulary.
const paramName = (def) => def.param || def.name;
// The only door query data enters through: every value is a string ('' for a
// bare `?flag`), and the last occurrence of a repeated key wins.
export const queryFromSearch = (search) =>
  Object.fromEntries(new URLSearchParams(search || ''));
// Which tab a history entry belongs to. One tab answers to several spellings of
// its path - trailing slash, the '/occurrences' alias, any casing - which the
// parent folds together too (getTabFromRoute); any other path stays distinct.
const historyEntryTabKey = (pathname) =>
  pathname.toLowerCase().replace(/(\/occurrences)?\/*$/, '');

function splitAllowed(raw, allowed) {
  return (raw || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => allowed.includes(entry));
}

// Both audit views use <date-time-range-filter-pill date-only> without
// emit-date-as-millis: anything but a "YYYY-MM-DD" string renders "Invalid Date"
// in the pill while still reaching the API. The round-trip rejects 2024-02-30.
function parseDateBoundary(raw) {
  if (!DATE_ONLY_PATTERN.test(raw || '')) return null;
  const parsed = new Date(`${raw}T00:00:00Z`);
  const iso = Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  return iso.slice(0, 10) === raw ? raw : null;
}
// Bounds outside the pill's own range are rejected rather than clamped: a
// clamped bound claims a filter nobody asked for.
function parseNumberBoundary(raw, def) {
  const parsed = raw ? Number(raw) : NaN;
  const belowMin = typeof def.min === 'number' && parsed < def.min;
  const aboveMax = typeof def.max === 'number' && parsed > def.max;
  return Number.isFinite(parsed) && !belowMin && !aboveMax ? parsed : null;
}
function rangeCodec(lowKey, highKey, parseBoundary, rejectInverted) {
  return {
    encode: (def, value) => {
      const encoded = {};
      // `!= null` rather than truthiness, so a 0 bound survives.
      if (value && value[lowKey] != null)
        encoded[`${paramName(def)}From`] = value[lowKey];
      if (value && value[highKey] != null)
        encoded[`${paramName(def)}To`] = value[highKey];
      return encoded;
    },
    decode: (def, query) => {
      const low = parseBoundary(query[`${paramName(def)}From`], def);
      const high = parseBoundary(query[`${paramName(def)}To`], def);
      if (low === null && high === null) return null;
      // Only where the pill forbids it too: NumericRangeFilterPill's from/to
      // states make an inverted range unreachable, so one in the URL was
      // hand-written. The date pill has no such guard, so its own bookmark
      // would lose the pill.
      if (rejectInverted && low !== null && high !== null && low > high)
        return null;
      // Both keys always present: the pills test `value.from !== null`.
      return { [lowKey]: low, [highKey]: high };
    },
  };
}

// Per filter type: how to write the current value into query parameters and read
// it back. `decode` yields null (false for booleans) to leave the filter alone.
export const FILTER_QUERY_CODECS = {
  boolean: {
    encode: (def, value) =>
      value === true ? { [paramName(def)]: 'true' } : {},
    // A bare `?showInactive` arrives as '', which still means "on".
    decode: (def, query) => {
      const value = query[paramName(def)];
      return typeof value === 'string' && !/^(false|0)$/i.test(value);
    },
  },
  multiselect: {
    encode: (def, value) =>
      Array.isArray(value) && value.length > 0
        ? { [paramName(def)]: value.join(',') }
        : {},
    decode: (def, query) => {
      const allowed = (def.options || []).map((option) => option.value);
      const selected = splitAllowed(query[paramName(def)], allowed);
      return selected.length > 0 ? selected : null;
    },
  },
  text: {
    encode: (def, value) => {
      if (!value || !value.value) return {};
      const encoded = { [`${paramName(def)}Input`]: value.value };
      // The pill never searches without fields; this only keeps a dangling
      // `&textSearchField=` out of a hand-written URL.
      if ((value.fields || []).length > 0)
        encoded[`${paramName(def)}Field`] = value.fields.join(',');
      return encoded;
    },
    decode: (def, query) => {
      const text = (query[`${paramName(def)}Input`] || '').trim();
      if (!text) return null;
      // An omitted or unusable field list searches everything, as the pill does.
      const allowed = (def.fields || []).map((field) => field.value);
      const fields = splitAllowed(query[`${paramName(def)}Field`], allowed);
      return { fields: fields.length ? fields : allowed, value: text };
    },
  },
  daterange: rangeCodec('since', 'before', parseDateBoundary),
  numrange: rangeCodec('from', 'to', parseNumberBoundary, true),
};
export default {
  props: {
    // Set for the tab the route points at, so tabs never fight over the URL. A
    // syncing host must be one whole tab in the sense of historyEntryTabKey.
    filterUrlSync: { type: Boolean, default: false },
  },
  data: () => ({
    pendingFilters: {},
  }),
  computed: {
    activeFilterCount() {
      return this.allFilterDefs.filter((f) => this.hasFilterValue(f.name))
        .length;
    },
    addFilterOptions() {
      return this.allFilterDefs.filter((f) => !this.isFilterVisible(f.name));
    },
  },
  created() {
    if (this.filterUrlSync) {
      // Hydrated before the watchers below exist, so a bookmark never looks
      // like a user edit. Rewriting options.url - which a syncing host owes,
      // along with apiUrl() - makes the table's first request already filtered.
      const query = queryFromSearch(window.location.search);
      if (this.applyFilterQuery(query) && this.options && this.apiUrl) {
        this.options.url = this.apiUrl();
      }
      // Drops what no codec claimed, so the URL shows exactly the pills on screen.
      this.syncFilterQueryToUrl();
      this._ownedHistoryTab = historyEntryTabKey(window.location.pathname);
      window.addEventListener('popstate', this._noteHistoryQuery);
    }
    this.allFilterDefs.forEach((def) => {
      const name = def.name;
      const isBoolean = this.isBooleanFilter(def);
      this.$watch(this.filterDataKey(def), (val) => {
        if (!isBoolean) {
          const hasValue = Array.isArray(val) ? val.length > 0 : !!val;
          if (hasValue) this.$set(this.pendingFilters, name, false);
        }
        if (!this._clearing && typeof this.refreshTable === 'function') {
          this.refreshTable();
        }
        // Runs even while clearing, so "clear all" reaches the URL too. Vue
        // queues these callbacks, so a bulk clear's twelve assignments end up
        // as one effective write and eleven no-ops.
        this.syncFilterQueryToUrl();
      });
    });
  },
  watch: {
    filterUrlSync(active) {
      // A popstate that does not change tabs leaves its note unconsumed on the
      // inactive tab, so honour a note only while the address bar still shows the
      // entry it was taken for - otherwise the next tab switch would read a stale
      // one and reset the arriving tab against an entry it never described.
      const fromHistory = this._pendingHistoryQueryUrl === window.location.href;
      this._pendingHistoryQueryUrl = null;
      if (!active) return;
      // The address bar always leads the prop, so it already names this tab here.
      this._ownedHistoryTab = historyEntryTabKey(window.location.pathname);
      // A tab created while hidden - always the one the page did not land on -
      // skipped created()'s registration. Re-adding the same bound method is a
      // no-op, so ownership can change hands repeatedly without stacking handlers.
      window.addEventListener('popstate', this._noteHistoryQuery);
      if (fromHistory)
        this.applyFilterQuery(queryFromSearch(window.location.search), true);
      // Newly the visible tab, so its own state owns the whole query string
      // again - which also cleans up after a tab click, whose guarded
      // navigation leaves the leaving tab's query behind until it resolves.
      this.syncFilterQueryToUrl();
    },
  },
  mounted() {
    // Move bootstrap-table's built-in toolbar controls (refresh, column toggle)
    // into the filter bar so they appear in one cohesive row.
    //
    // This depends on bootstrap-table rendering a `.columns` div as a direct
    // child of `.fixed-table-toolbar` during its mounted() hook.
    //
    // We also listen for bootstrap-table's post-body event to re-run the move,
    // since initToolbar() can recreate the `.columns` div (e.g. on option changes).
    this.$nextTick(() => {
      this._adoptTableControls();
      const table = this._queryEl('table');
      if (table) {
        jQuery(table).on('post-body.bs.table.filterPillsMixin', () => {
          this._adoptTableControls();
        });
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener('popstate', this._noteHistoryQuery);
    const table = this._queryEl('table');
    if (table) {
      jQuery(table).off('post-body.bs.table.filterPillsMixin');
    }
  },
  methods: {
    _queryEl(selector) {
      // `$el` is a comment placeholder when the render function throws,
      // which has no querySelector. Guard so lifecycle hooks don't pile
      // on top of an existing render error.
      const el = this.$el;
      return el && typeof el.querySelector === 'function'
        ? el.querySelector(selector)
        : null;
    },
    _adoptTableControls() {
      const filterBar = this._queryEl('.filter-bar');
      if (!filterBar) return;
      const toolbar = filterBar.closest('.fixed-table-toolbar');
      if (!toolbar) return;
      const columns = toolbar.querySelector(':scope > .columns');
      if (!columns) return;
      columns.style.setProperty('float', 'none', 'important');
      columns.style.marginLeft = 'auto';
      columns.style.flexShrink = '0';
      columns.style.alignSelf = 'flex-start';
      columns.style.borderLeft = '1px solid rgb(255 255 255 / 10%)';
      columns.style.paddingLeft = '0.5rem';
      columns.querySelectorAll('.btn').forEach((btn) => {
        if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
          const title = btn.getAttribute('title') || btn.getAttribute('name');
          if (title) btn.setAttribute('aria-label', title);
        }
      });
      filterBar.appendChild(columns);
    },
    // The single derivation of "this filter is a boolean toggle": booleanFilters
    // is authoritative (templates ask by name) and a def's `type: 'boolean'`
    // restates it. Booleans live in a plain data property, the rest in `<name>Filter`.
    isBooleanFilter(defOrName) {
      const { name, type } = defOrName.name ? defOrName : { name: defOrName };
      return type === 'boolean' || (this.booleanFilters || []).includes(name);
    },
    filterDataKey(defOrName) {
      const name = defOrName.name || defOrName;
      return this.isBooleanFilter(defOrName) ? name : name + 'Filter';
    },
    filterCodec(def) {
      const type = this.isBooleanFilter(def) ? 'boolean' : def.type;
      return FILTER_QUERY_CODECS[type];
    },
    // Back/forward swaps the whole address bar, so that entry's query - not this
    // view's live state - is the truth for the tab it names, which only learns
    // it is named once the guarded navigation resolves. Hence the note.
    _noteHistoryQuery() {
      this._pendingHistoryQueryUrl = window.location.href;
      // A jump between two entries of the tab on screen hands ownership to nobody,
      // so no watcher runs to consume the note: adopt here. Not on ownership alone -
      // a cross-tab jump reaches the LEAVING tab while it still reads as the owner,
      // the guarded navigation being unresolved; only the entry's own tab may adopt.
      if (
        this.filterUrlSync &&
        historyEntryTabKey(window.location.pathname) === this._ownedHistoryTab
      ) {
        this.applyFilterQuery(queryFromSearch(window.location.search), true);
      }
    },
    hasFilterValue(name) {
      const val = this[this.filterDataKey(name)];
      return Array.isArray(val) ? val.length > 0 : !!val;
    },
    isFilterVisible(name) {
      return this.pendingFilters[name] || this.hasFilterValue(name);
    },
    showFilter(name) {
      if (this.isBooleanFilter(name)) {
        this[name] = true;
        return;
      }
      this.$set(this.pendingFilters, name, true);
      this.$nextTick(() => {
        this.$nextTick(() => {
          const ref = this.$refs['filter_' + name];
          if (ref && ref.open) {
            ref.open();
          }
        });
      });
    },
    onFilterDismiss(name) {
      this.$set(this.pendingFilters, name, false);
    },
    clearPendingFilters() {
      Object.keys(this.pendingFilters).forEach((k) => {
        this.pendingFilters[k] = false;
      });
    },
    // Current filter state as query parameters; a filter joins in by declaring a
    // `type` in allFilterDefs. The same builder feeds the address bar and each
    // view's apiUrl(), so the two cannot drift. A method, not a computed,
    // because apiUrl() runs from data(), before computed properties exist.
    buildFilterQuery() {
      const query = {};
      (this.allFilterDefs || []).forEach((def) => {
        const codec = this.filterCodec(def);
        const value = this[this.filterDataKey(def)];
        if (codec) Object.assign(query, codec.encode(def, value));
      });
      return query;
    },
    // Returns true when any filter ended up set. Without `reset` a filter the
    // query does not mention is left alone - the created() call, which runs
    // before the watchers exist and while every filter holds its default. With
    // `reset` (back/forward) the entry's query is the whole truth instead.
    applyFilterQuery(query, reset) {
      let anyApplied = false;
      this.allFilterDefs.forEach((def) => {
        const codec = this.filterCodec(def);
        if (!codec) return;
        const decoded = codec.decode(def, query);
        if (decoded !== null && decoded !== false) {
          this.assignFilterValue(def, codec, decoded);
          anyApplied = true;
        } else if (reset) {
          // `false` is the boolean codec's empty value, the only one that is
          // not null; a multiselect pill's is [].
          const empty = def.type === 'multiselect' ? [] : null;
          this.assignFilterValue(def, codec, decoded === false ? false : empty);
        }
      });
      return anyApplied;
    },
    // Decoding mints fresh arrays and objects, so assigning unconditionally would
    // trip the filter's watcher - and the refreshTable() server request behind it
    // - even when the value is unchanged. The codec is its own equality oracle.
    assignFilterValue(def, codec, value) {
      const dataKey = this.filterDataKey(def);
      const encodedCurrent = codec.encode(def, this[dataKey]);
      if (common.sameQueryParams(encodedCurrent, codec.encode(def, value))) {
        return;
      }
      this[dataKey] = value;
    },
    // Written directly, never through the router: refining a filter is not a
    // navigation, and $router.replace() would run the permission-guarded
    // beforeEach hook and scrollBehavior on every edit. So this.$route does not
    // track these writes and filter state is read from window.location instead.
    // Known limitation: clicking the sidebar entry for the page you are already
    // on is a duplicate navigation, whose ensureURL() restores vue-router's stale
    // fullPath and drops the query until the next filter edit.
    syncFilterQueryToUrl() {
      if (!this.filterUrlSync) return;
      // pathname, not $route.path: the router's base path is already part of it.
      const { pathname, search } = window.location;
      const next = common.setQueryParams(pathname, this.buildFilterQuery());
      // history.state is passed through: it carries vue-router's scroll key.
      if (next !== pathname + search)
        window.history.replaceState(window.history.state, '', next);
    },
  },
};
