import jQuery from 'jquery';
import common from '@/shared/common';

// Delay before filter state is written back to the URL. Mirrors the debounce
// used for table refreshes so that bulk changes (e.g. "clear all") collapse
// into a single history entry.
const QUERY_SYNC_DELAY_MS = 250;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const INTEGER_PATTERN = /^\d+$/;

// A query parameter may appear more than once, in which case vue-router hands
// us an array. The last occurrence wins, mirroring URLSearchParams.set().
//
// Values parsed from a URL are always strings, but a query object built in
// memory (as this mixin does when writing) can still hold the original numbers
// and booleans, so coerce those rather than discarding them.
function singleValue(raw) {
  const value = Array.isArray(raw) ? raw[raw.length - 1] : raw;
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function splitList(raw) {
  const value = singleValue(raw);
  if (value === null) {
    return [];
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

// Date pills emit either a "YYYY-MM-DD" string (dateOnly) or epoch millis.
// Accept both shapes so the codec works for every date pill configuration,
// and reject anything else rather than forwarding junk to the API.
function parseDateBoundary(raw) {
  const value = singleValue(raw);
  if (value === null) {
    return null;
  }
  if (DATE_ONLY_PATTERN.test(value)) {
    return value;
  }
  if (INTEGER_PATTERN.test(value)) {
    return Number(value);
  }
  return null;
}

function parseNumberBoundary(raw, def) {
  const value = singleValue(raw);
  if (value === null || value.length === 0) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  let clamped = parsed;
  if (typeof def.min === 'number') {
    clamped = Math.max(def.min, clamped);
  }
  if (typeof def.max === 'number') {
    clamped = Math.min(def.max, clamped);
  }
  return clamped;
}

// Per filter type: which query parameters it owns, how to write the current
// value into them, and how to read a value back out. `decode` returns null when
// the query holds nothing usable, which leaves the filter at its default.
const FILTER_QUERY_CODECS = {
  boolean: {
    keys: (def) => [def.name],
    encode: (def, value) => (value === true ? { [def.name]: 'true' } : {}),
    decode: (def, query) =>
      String(singleValue(query[def.name])).toLowerCase() === 'true',
  },
  multiselect: {
    keys: (def) => [def.name],
    encode: (def, value) =>
      Array.isArray(value) && value.length > 0
        ? { [def.name]: value.join(',') }
        : {},
    decode: (def, query) => {
      const allowed = (def.options || []).map((option) => option.value);
      const selected = splitList(query[def.name]).filter(
        (entry) => allowed.length === 0 || allowed.includes(entry),
      );
      return selected.length > 0 ? selected : null;
    },
  },
  text: {
    keys: (def) => [def.name, `${def.name}Fields`],
    encode: (def, value) =>
      value && value.value
        ? {
            [def.name]: value.value,
            [`${def.name}Fields`]: (value.fields || []).join(','),
          }
        : {},
    decode: (def, query) => {
      const text = singleValue(query[def.name]);
      if (text === null || text.trim().length === 0) {
        return null;
      }
      const allowed = (def.fields || []).map((field) => field.value);
      let fields = splitList(query[`${def.name}Fields`]).filter(
        (entry) => allowed.length === 0 || allowed.includes(entry),
      );
      // An omitted or fully invalid field list searches everything, which is
      // what the pill itself defaults to.
      if (fields.length === 0) {
        fields = allowed;
      }
      return { fields, value: text.trim() };
    },
  },
  daterange: {
    keys: (def) => [`${def.name}From`, `${def.name}To`],
    encode: (def, value) => {
      if (!value) {
        return {};
      }
      const encoded = {};
      if (value.since !== null && value.since !== undefined) {
        encoded[`${def.name}From`] = value.since;
      }
      if (value.before !== null && value.before !== undefined) {
        encoded[`${def.name}To`] = value.before;
      }
      return encoded;
    },
    decode: (def, query) => {
      const since = parseDateBoundary(query[`${def.name}From`]);
      const before = parseDateBoundary(query[`${def.name}To`]);
      if (since === null && before === null) {
        return null;
      }
      return { since, before };
    },
  },
  numrange: {
    keys: (def) => [`${def.name}From`, `${def.name}To`],
    encode: (def, value) => {
      if (!value) {
        return {};
      }
      const encoded = {};
      if (value.from !== null && value.from !== undefined) {
        encoded[`${def.name}From`] = value.from;
      }
      if (value.to !== null && value.to !== undefined) {
        encoded[`${def.name}To`] = value.to;
      }
      return encoded;
    },
    decode: (def, query) => {
      const from = parseNumberBoundary(query[`${def.name}From`], def);
      const to = parseNumberBoundary(query[`${def.name}To`], def);
      if (from === null && to === null) {
        return null;
      }
      return { from, to };
    },
  },
};

export default {
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
    // Filters that can be represented in the URL. A filter opts in by declaring
    // a `type` in allFilterDefs; booleans are recognised via `booleanFilters`.
    filterQueryDefs() {
      return this.allFilterDefs
        .map((def) => ({
          ...def,
          type:
            this.booleanFilters && this.booleanFilters.includes(def.name)
              ? 'boolean'
              : def.type,
        }))
        .filter((def) =>
          Object.prototype.hasOwnProperty.call(FILTER_QUERY_CODECS, def.type),
        );
    },
  },
  created() {
    // Seed from the URL before the watchers exist, so restoring a bookmark
    // does not look like a user edit and immediately echo back.
    if (this.filterUrlSync) {
      this._filterQueryHydrated = this.applyFilterQuery(this.$route.query);
      // data() built the table's URL before those filters existed. Rewrite it
      // here, while the table component is still to be created, so a bookmark
      // loads filtered data in one request instead of fetching twice.
      if (
        this._filterQueryHydrated &&
        this.options &&
        typeof this.apiUrl === 'function'
      ) {
        this.options.url = this.apiUrl();
      }
    }

    this.allFilterDefs.forEach((def) => {
      const name = def.name;
      const isBoolean =
        this.booleanFilters && this.booleanFilters.includes(name);
      const dataKey = isBoolean ? name : name + 'Filter';

      this.$watch(dataKey, (val) => {
        if (!isBoolean) {
          const hasValue = Array.isArray(val) ? val.length > 0 : !!val;
          if (hasValue) this.$set(this.pendingFilters, name, false);
        }
        if (!this._clearing && typeof this.refreshTable === 'function') {
          this.refreshTable();
        }
        // Runs even while clearing, so "clear all" is reflected in the URL.
        this.scheduleFilterQuerySync();
      });
    });
  },
  watch: {
    $route() {
      if (!this.filterUrlSync) {
        return;
      }
      // Ignore the echo of our own write.
      if (this._filterQuerySelfNavigation) {
        this._filterQuerySelfNavigation = false;
        return;
      }
      // Any navigation we did not initiate (bookmark, back/forward, tab
      // switch) makes the URL authoritative again for whichever view is now
      // on screen. Deferred so the tab pane's active class is up to date.
      this.$nextTick(() => {
        if (!this.isActiveFilterView()) {
          return;
        }
        this.applyFilterQuery(this.$route.query);
      });
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
    if (this._filterQuerySyncTimer) {
      clearTimeout(this._filterQuerySyncTimer);
    }
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
    hasFilterValue(name) {
      if (this.booleanFilters && this.booleanFilters.includes(name)) {
        return !!this[name];
      }
      const val = this[name + 'Filter'];
      return Array.isArray(val) ? val.length > 0 : !!val;
    },
    isFilterVisible(name) {
      return this.pendingFilters[name] || this.hasFilterValue(name);
    },
    showFilter(name) {
      if (this.booleanFilters && this.booleanFilters.includes(name)) {
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
    filterDataKey(def) {
      return def.type === 'boolean' ? def.name : def.name + 'Filter';
    },
    // Every query parameter owned by this view's filters.
    ownedFilterQueryKeys() {
      return this.filterQueryDefs.reduce(
        (keys, def) => keys.concat(FILTER_QUERY_CODECS[def.type].keys(def)),
        [],
      );
    },
    // Current filter state expressed as query parameters.
    buildFilterQuery() {
      return this.filterQueryDefs.reduce((query, def) => {
        const encoded = FILTER_QUERY_CODECS[def.type].encode(
          def,
          this[this.filterDataKey(def)],
        );
        return Object.assign(query, encoded);
      }, {});
    },
    // Overwrite filter state from query parameters. Filters the query says
    // nothing about are reset, so a bookmark always describes the full view.
    // Returns true when any filter ended up set.
    applyFilterQuery(query) {
      let anyApplied = false;
      this.filterQueryDefs.forEach((def) => {
        const codec = FILTER_QUERY_CODECS[def.type];
        const present = codec
          .keys(def)
          .some((key) =>
            Object.prototype.hasOwnProperty.call(query || {}, key),
          );
        const decoded = present ? codec.decode(def, query) : null;
        const dataKey = this.filterDataKey(def);
        if (decoded === null || decoded === false) {
          this[dataKey] = def.type === 'boolean' ? false : this.emptyValue(def);
          return;
        }
        this[dataKey] = decoded;
        anyApplied = true;
      });
      return anyApplied;
    },
    emptyValue(def) {
      return def.type === 'multiselect' ? [] : null;
    },
    scheduleFilterQuerySync() {
      if (!this.filterUrlSync) {
        return;
      }
      if (this._filterQuerySyncTimer) {
        clearTimeout(this._filterQuerySyncTimer);
      }
      this._filterQuerySyncTimer = setTimeout(() => {
        this.syncFilterQueryToUrl();
      }, QUERY_SYNC_DELAY_MS);
    },
    syncFilterQueryToUrl() {
      // While two tabbed views share a route, only the visible one may own the
      // query string.
      if (!this.filterUrlSync || !this.isActiveFilterView()) {
        return;
      }
      const owned = this.ownedFilterQueryKeys();
      const preserved = Object.entries(this.$route.query || {}).reduce(
        (query, [key, value]) => {
          if (!owned.includes(key)) {
            query[key] = value;
          }
          return query;
        },
        {},
      );
      const query = Object.assign(preserved, this.buildFilterQuery());
      if (common.sameQueryParams(query, this.$route.query)) {
        return;
      }
      // replace() rather than push(): filtering is a refinement of the current
      // view, not a separate destination to step back through.
      this._filterQuerySelfNavigation = true;
      this.$router.replace({ path: this.$route.path, query }).catch(() => {
        // Redundant navigations reject in vue-router 3; nothing to recover.
        this._filterQuerySelfNavigation = false;
      });
    },
    isActiveFilterView() {
      const el = this.$el;
      if (!el || typeof el.closest !== 'function') {
        return false;
      }
      const pane = el.closest('.tab-pane');
      return !pane || pane.classList.contains('active');
    },
  },
};
