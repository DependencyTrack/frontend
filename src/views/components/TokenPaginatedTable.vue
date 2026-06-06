<template>
  <div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="tableData"
      :options="tableOptions"
    >
    </bootstrap-table>
    <div
      class="mt-2 d-flex flex-wrap justify-content-between align-items-center"
    >
      <div class="pagination-meta d-flex align-items-center flex-wrap">
        <span
          v-if="totalCountDisplay"
          class="pagination-meta-text"
          :title="
            totalCountType === 'AT_LEAST'
              ? $t('message.total_rows_at_least_tooltip')
              : null
          "
        >
          {{ totalCountDisplay }} {{ $t('message.total_rows') }}
        </span>
        <span
          v-if="totalCountDisplay"
          class="pagination-meta-divider"
          aria-hidden="true"
        ></span>
        <label
          class="pagination-meta-text mb-0 mr-2"
          for="pagination-page-size-select"
        >
          {{ $t('message.rows_per_page') }}
        </label>
        <b-form-select
          id="pagination-page-size-select"
          v-model="currentPageSize"
          class="pagination-page-size-select"
        >
          <b-form-select-option
            v-for="pageSize in allowedPageSizes"
            :key="`pageSize-${pageSize}`"
            :value="pageSize"
            >{{ pageSize }}
          </b-form-select-option>
        </b-form-select>
      </div>
      <div class="d-flex align-items-center">
        <b-button-group class="pagination-group">
          <b-button
            id="pagination-button-first"
            class="pagination-button"
            :disabled="!hasPreviousPage || isLoading"
            :aria-label="$t('message.first_page')"
            :title="$t('message.first_page')"
            @click="goToFirstPage"
          >
            <i class="fa fa-angle-double-left" aria-hidden="true"></i>
          </b-button>
          <b-button
            id="pagination-button-prev"
            class="pagination-button"
            :disabled="!hasPreviousPage || isLoading"
            :aria-label="$t('message.previous_page')"
            :title="$t('message.previous_page')"
            @click="goToPrevPage"
          >
            <i class="fa fa-angle-left" aria-hidden="true"></i>
          </b-button>
        </b-button-group>
        <span class="page-indicator" aria-live="polite">
          {{ $t('message.page_indicator', { n: currentPageNumber }) }}
        </span>
        <b-button-group class="pagination-group">
          <b-button
            id="pagination-button-next"
            class="pagination-button"
            :disabled="!hasNextPage || isLoading"
            :aria-label="$t('message.next_page')"
            :title="$t('message.next_page')"
            @click="goToNextPage"
          >
            <i class="fa fa-angle-right" aria-hidden="true"></i>
          </b-button>
        </b-button-group>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/style';

.page-indicator {
  padding: $pagination-padding-y 0.75rem;
  font-weight: $font-weight-normal;
  line-height: $pagination-line-height;
  color: $body-color;
  cursor: default;
  user-select: none;
}

.pagination-meta-text {
  font-size: $font-size-base;
  font-weight: $font-weight-normal;
  color: $body-color;
}

.pagination-meta-divider {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 0.75rem;
  background-color: $pagination-border-color;
}

.pagination-page-size-select {
  width: auto;
}

.pagination-button {
  position: relative;
  display: block;
  padding: $pagination-padding-y 1.25rem;
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
import { handleTableLoadError } from '@/shared/utils';

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
      isLoading: false,
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
      this.isLoading = true;

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
        handleTableLoadError(err && err.response && err.response.data, {
          fallback: false,
        });
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
          this.isLoading = false;
        }
      }
    },
    async goToFirstPage() {
      if (!this.hasPreviousPage) {
        return;
      }
      await this.reset();
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
