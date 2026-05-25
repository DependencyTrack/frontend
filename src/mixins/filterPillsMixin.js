import jQuery from 'jquery';

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
  },
  created() {
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
      });
    });
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
  },
};
