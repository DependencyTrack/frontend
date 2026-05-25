<template>
  <div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="tableData"
      :options="tableOptions"
    >
    </bootstrap-table>
    <div class="mt-2 d-flex justify-content-between align-items-center">
      <div>
        <b-button
          id="pagination-button-prev"
          class="pagination-button"
          :disabled="!hasPreviousPage"
          @click="goToPrevPage"
          >‹ {{ $t('message.previous') }}
        </b-button>
      </div>
      <div class="d-flex align-items-center">
        <span v-if="totalCountDisplay" class="total-count-indicator mr-3">
          {{ totalCountDisplay }} {{ $t('message.total_rows') }}
        </span>
        <b-form-group
          :label="$t('message.rows_per_page')"
          label-for="pagination-page-size-select"
          label-cols="auto"
          class="mb-0"
        >
          <b-form-select
            id="pagination-page-size-select"
            v-model="currentPageSize"
          >
            <b-form-select-option
              v-for="pageSize in allowedPageSizes"
              :key="`pageSize-${pageSize}`"
              :value="pageSize"
              >{{ pageSize }}
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
      </div>
      <div>
        <b-button
          id="pagination-button-next"
          class="pagination-button"
          :disabled="!hasNextPage"
          @click="goToNextPage"
          >{{ $t('message.next') }} ›
        </b-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/style';

.page-indicator {
  font-weight: 500;
  color: $pagination-color;
}

.total-count-indicator {
  color: $pagination-color;
}

.pagination-button {
  position: relative;
  display: block;
  padding: $pagination-padding-y $pagination-padding-x;
  margin-left: -$pagination-border-width;
  line-height: $pagination-line-height;
  color: $pagination-color;
  text-decoration: if($link-decoration == none, null, none);
  background-color: $pagination-bg;
  border: $pagination-border-width solid $pagination-border-color;

  &:disabled {
    z-index: 2;
    color: $pagination-disabled-color;
    text-decoration: none;
    background-color: $pagination-disabled-bg;
    border-color: $pagination-disabled-border-color;
  }

  &:not(:disabled):hover {
    z-index: 2;
    color: $pagination-hover-color;
    text-decoration: none;
    background-color: $pagination-hover-bg;
    border-color: $pagination-hover-border-color;
  }

  &:not(:disabled):focus {
    z-index: 3;
    outline: $pagination-focus-outline;
    box-shadow: $pagination-focus-box-shadow;
  }
}
</style>

<script>
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import common from '@/shared/common';

export default {
  name: 'TokenPaginatedTable',
  mixins: [bootstrapTableMixin],
  props: {
    baseUrl: String,
    responseDataField: String,
    columns: Array,
    options: {},
    // Extra query params merged into every request without becoming part of
    // the stored page URLs. Use this for view-time concerns like `expand` so
    // toggling them refreshes in place instead of resetting pagination.
    // Values may be arrays — `setQueryParams` will emit repeated params.
    extraQueryParams: {
      type: Object,
      default: () => ({}),
    },
    defaultPageSize: {
      type: Number,
      default: 10,
      validator: (value) => [5, 10, 15, 20].includes(value),
    },
    pageSizeStorageKey: {
      type: String,
      default: null,
    },
    debounceMs: {
      type: Number,
      default: 300,
    },
  },
  data() {
    const userOptions = this.options || {};
    const userOnColumnSwitch = userOptions.onColumnSwitch;
    const userOnColumnSwitchAll = userOptions.onColumnSwitchAll;
    const allowedPageSizes = [5, 10, 15, 20];
    const storedPageSize = this.readStoredPageSize(allowedPageSizes);
    return {
      currentPageNumber: 1,
      currentPageSize:
        storedPageSize !== null ? storedPageSize : this.defaultPageSize,
      currentPageUrl: null,
      allowedPageSizes,
      nextPageUrl: null,
      pageUrlHistory: [],
      tableData: [],
      tableOptions: {
        showColumns: true,
        showRefresh: true,
        // No-op customSort: rows are server-sorted, so suppress bootstrap-table's
        // built-in client-side reorder. onSort still fires so consumers can update
        // their sort state and trigger a re-fetch.
        customSort: () => {},
        // Pass-through customSearch: search is server-side,
        // so disable bootstrap-table's client-side filter.
        // It crashes on dotted column fields (e.g. `a.b`) when a row lacks `a`.
        customSearch: (data) => data,
        onRefresh: () => {
          this.refreshCurrentPage();
        },
        icons: {
          refresh: 'fa-refresh',
        },
        ...userOptions,
        onColumnSwitch: (field, checked) => {
          if (typeof userOnColumnSwitch === 'function') {
            userOnColumnSwitch(field, checked);
          }
          this.emitVisibleColumns();
        },
        onColumnSwitchAll: (checked) => {
          if (typeof userOnColumnSwitchAll === 'function') {
            userOnColumnSwitchAll(checked);
          }
          this.emitVisibleColumns();
        },
      },
      currentRequestId: 0,
      debounceTimer: null,
      extraParamsTimer: null,
      totalCount: null,
      totalCountType: null,
    };
  },
  computed: {
    hasNextPage() {
      return this.nextPageUrl !== undefined && this.nextPageUrl !== null;
    },
    hasPreviousPage() {
      return this.pageUrlHistory.length > 0;
    },
    totalCountDisplay() {
      if (this.totalCount === null) {
        return null;
      }
      return this.totalCountType === 'AT_LEAST'
        ? `${this.totalCount}+`
        : `${this.totalCount}`;
    },
  },
  methods: {
    async loadPage(pageUrl) {
      this.$refs.table.showLoading();

      const requestId = ++this.currentRequestId;

      try {
        const fetchUrl = common.setQueryParams(pageUrl, {
          ...this.extraQueryParams,
          limit: this.currentPageSize,
        });

        const response = await this.axios.get(fetchUrl);
        if (requestId !== this.currentRequestId) {
          return;
        }

        this.tableData = response.data['items'] || [];
        this.currentPageUrl = pageUrl;

        const nextPageToken = response.data.next_page_token;
        if (nextPageToken) {
          this.nextPageUrl = common.setQueryParams(pageUrl, {
            page_token: nextPageToken,
          });
        } else {
          this.nextPageUrl = null;
        }

        const total = response.data.total;
        if (total) {
          this.totalCount = total.count;
          this.totalCountType = total.type;
        } else {
          this.totalCount = null;
          this.totalCountType = null;
        }
        this.$emit('total', this.totalCountDisplay);
      } catch (err) {
        if (requestId !== this.currentRequestId) {
          return;
        }

        console.error(`Failed to load page ${pageUrl}: ${err}`);
        this.tableData = [];
        this.currentPageNumber = 1;
        this.currentPageUrl = null;
        this.nextPageUrl = null;
        this.pageUrlHistory = [];
        this.totalCount = null;
        this.totalCountType = null;
        this.$emit('total', this.totalCountDisplay);
      } finally {
        if (requestId === this.currentRequestId) {
          this.$refs.table.hideLoading();
        }
      }
    },
    async goToPrevPage() {
      if (!this.hasPreviousPage) {
        return;
      }

      this.currentPageNumber--;

      if (this.currentPageNumber === 1) {
        this.pageUrlHistory = [];
        await this.loadPage(this.baseUrl);
      } else {
        const prevPageUrl = this.pageUrlHistory.pop();
        await this.loadPage(prevPageUrl);
      }
    },
    async refreshCurrentPage() {
      if (this.currentPageUrl === null) {
        await this.reset();
        return;
      }
      await this.loadPage(this.currentPageUrl);
    },
    async goToNextPage() {
      if (!this.hasNextPage) {
        return;
      }

      this.pageUrlHistory.push(this.currentPageUrl);

      this.currentPageNumber++;
      await this.loadPage(this.nextPageUrl);
    },
    async reset() {
      this.currentPageNumber = 1;
      this.pageUrlHistory = [];
      this.nextPageUrl = null;
      this.totalCount = null;
      this.totalCountType = null;
      await this.loadPage(this.baseUrl);
    },
    emitVisibleColumns() {
      const fields = this.$refs.table.getVisibleColumns().map((c) => c.field);
      this.$emit('visible-columns', fields);
    },
    readStoredPageSize(allowedPageSizes) {
      if (!this.pageSizeStorageKey || typeof localStorage === 'undefined') {
        return null;
      }
      const raw = localStorage.getItem(this.pageSizeStorageKey);
      if (raw === null) {
        return null;
      }
      const parsed = Number(raw);
      return allowedPageSizes.includes(parsed) ? parsed : null;
    },
  },
  mounted() {
    this.loadPage(this.baseUrl);
    this.emitVisibleColumns();
  },
  beforeDestroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.extraParamsTimer) {
      clearTimeout(this.extraParamsTimer);
    }
  },
  watch: {
    baseUrl() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.reset();
      }, this.debounceMs);
    },
    extraQueryParams: {
      deep: true,
      handler(newVal, oldVal) {
        if (this.currentPageUrl === null) {
          return;
        }
        // Skip refetch when the params are unchanged.
        // Consumers often derive `extraQueryParams` from reactive state
        // (e.g. visible columns) and return a fresh object each time.
        if (common.sameQueryParams(newVal, oldVal)) {
          return;
        }
        if (this.extraParamsTimer) {
          clearTimeout(this.extraParamsTimer);
        }
        this.extraParamsTimer = setTimeout(() => {
          this.refreshCurrentPage();
        }, this.debounceMs);
      },
    },
    async currentPageSize(newSize) {
      if (this.pageSizeStorageKey && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.pageSizeStorageKey, String(newSize));
      }
      await this.reset();
    },
  },
};
</script>
