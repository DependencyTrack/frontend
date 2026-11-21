import jQuery from 'jquery';
import {
  decodeFilters,
  encodeFilters,
  filterQueryKeys,
} from '@/shared/filterQuery';

const sortedJson = (query) =>
  JSON.stringify(Object.entries(query).sort(([a], [b]) => (a < b ? -1 : 1)));

export default {
  props: {
    // Mirrors the filters in the URL query: restores them on creation, so the
    // first request is the filtered one. Needs typed filter defs (see
    // filterQuery.js). The host builds that request's URL in its own created(),
    // from filterQueryParams(), after this restore.
    filterUrlSync: { type: Boolean, default: false },
    // Whether this view may write the query and follow its changes. Views that
    // share a route set it for the one the route points at, so they never fight
    // over the URL.
    filterUrlActive: { type: Boolean, default: true },
  },
  data: () => ({
    booleanFilters: [],
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
      // Before the watchers below exist, so a bookmark doesn't look like an edit.
      this.applyFiltersFromRoute();
    }
    this.allFilterDefs.forEach((def) => {
      const name = def.name;
      const isBoolean = this.isBooleanFilter(name);
      const dataKey = this.filterDataKey(name);

      this.$watch(dataKey, (val) => {
        if (!isBoolean) {
          const hasValue = Array.isArray(val) ? val.length > 0 : !!val;
          if (hasValue)
            this.pendingFilters = { ...this.pendingFilters, [name]: false };
        }
        if (!this._clearing && typeof this.refreshTable === 'function') {
          this.refreshTable();
        }
        this.writeFiltersToRoute();
      });
    });
  },
  watch: {
    // Back and forward, or a link, changed the filters from outside.
    '$route.query'() {
      if (
        this.filterUrlSync &&
        this.filterUrlActive &&
        this.applyFiltersFromRoute()
      ) {
        this.refreshTable();
      }
    },
    // A tab that was hidden may be stale compared to what the URL now says.
    filterUrlActive(active) {
      if (active && this.filterUrlSync && this.applyFiltersFromRoute()) {
        this.refreshTable();
      }
    },
  },
  mounted() {
    // Move bootstrap-table's built-in toolbar controls (search, refresh, column
    // toggle) into the filter bar so they appear in one row.
    //
    // This depends on bootstrap-table rendering `.search` / `.columns` divs as
    // direct children of `.fixed-table-toolbar` during its mounted() hook.
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
  beforeUnmount() {
    const table = this._queryEl('table');
    if (table) {
      jQuery(table).off('post-body.bs.table.filterPillsMixin');
    }
  },
  methods: {
    typedFilterDefs() {
      return this.allFilterDefs.filter((def) => def.type);
    },
    // The data property holding a filter's value.
    filterDataKey(name) {
      return this.isBooleanFilter(name) ? name : name + 'Filter';
    },
    isBooleanFilter(name) {
      return !!this.booleanFilters && this.booleanFilters.includes(name);
    },
    // Query parameters, named like the REST API's, for the filters set. Feeds
    // both the address bar and the views' apiUrl(), so they can't drift apart.
    filterQueryParams() {
      const defs = this.typedFilterDefs();
      return encodeFilters(
        defs,
        Object.fromEntries(
          defs.map((def) => [def.name, this[this.filterDataKey(def.name)]]),
        ),
      );
    },
    // Returns whether any filter changed.
    applyFiltersFromRoute() {
      const defs = this.typedFilterDefs();
      const decoded = decodeFilters(defs, this.$route.query);
      let changed = false;
      for (const def of defs) {
        const target = decoded[def.name];
        const key = this.filterDataKey(def.name);
        const encode = (value) =>
          JSON.stringify(encodeFilters([def], { [def.name]: value }));
        if (encode(target) !== encode(this[key])) {
          this[key] = target;
          changed = true;
        }
      }
      return changed;
    },
    // Replaces rather than pushes, so tweaking a filter leaves no history behind.
    writeFiltersToRoute() {
      if (!this.filterUrlSync || !this.filterUrlActive) return;
      const owned = filterQueryKeys(this.typedFilterDefs());
      const query = Object.fromEntries(
        Object.entries(this.$route.query).filter(([key]) => !owned.has(key)),
      );
      Object.assign(query, this.filterQueryParams());
      if (sortedJson(query) !== sortedJson(this.$route.query)) {
        this.$router.replace({ query, hash: this.$route.hash });
      }
    },
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
      const search = toolbar.querySelector(':scope > .search');
      const columns = toolbar.querySelector(':scope > .columns');
      if (!search && !columns) return;
      [search, columns].filter(Boolean).forEach((el, index) => {
        el.style.setProperty('float', 'none', 'important');
        el.style.marginLeft = index === 0 ? 'auto' : '0.5rem';
        el.style.flexShrink = '0';
        el.style.alignSelf = 'flex-start';
        el.querySelectorAll('.form-control').forEach((input) => {
          input.classList.add('form-control-sm');
        });
        el.querySelectorAll('.btn').forEach((btn) => {
          if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
            const title = btn.getAttribute('title') || btn.getAttribute('name');
            if (title) btn.setAttribute('aria-label', title);
          }
        });
        filterBar.appendChild(el);
      });
    },
    hasFilterValue(name) {
      if (this.isBooleanFilter(name)) {
        return !!this[name];
      }
      const val = this[name + 'Filter'];
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
      this.pendingFilters = { ...this.pendingFilters, [name]: true };
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
      this.pendingFilters = { ...this.pendingFilters, [name]: false };
    },
    clearAllFilters() {
      this._clearing = true;
      try {
        this.allFilterDefs.forEach((def) => {
          if (this.isBooleanFilter(def.name)) {
            this[def.name] = false;
          } else {
            const key = def.name + 'Filter';
            this[key] = Array.isArray(this[key]) ? [] : null;
          }
        });
        this.clearPendingFilters();
      } finally {
        this._clearing = false;
      }
      if (typeof this.refreshTable === 'function') {
        this.refreshTable();
      }
    },
    clearPendingFilters() {
      Object.keys(this.pendingFilters).forEach((k) => {
        this.pendingFilters[k] = false;
      });
    },
  },
};
