<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <c-switch
        @click.native="saveViewState"
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showFlatView"
        color="primary"
        v-model="showFlatView"
        label
        v-bind="labelIcon"
        :disabled="!isTreeViewAllowed"
        v-b-tooltip.hover
        :title="$t('message.switch_view')"
      /><span class="text-muted">{{ $t('message.show_flat_view') }}</span>
    </div>
    <div id="projectsFilterBarRow" class="filter-bar-row">
      <div
        v-if="
          isPermitted([
            PERMISSIONS.PORTFOLIO_MANAGEMENT,
            PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
          ])
        "
        class="filter-bar-surface filter-bar-actions"
      >
        <b-button
          size="sm"
          variant="outline-primary"
          class="btn-create-project"
          @click="initializeProjectCreateProjectModal"
        >
          <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
        </b-button>
      </div>
      <div
        id="projectsFilterBar"
        class="filter-bar filter-bar-filters"
        role="toolbar"
        :aria-label="$t('message.filters')"
      >
        <div class="filter-pills">
          <text-filter-pill
            v-if="isFilterVisible('name')"
            ref="filter_name"
            :field-label="$t('message.project_name')"
            field-name="name"
            icon="fa-folder-open-o"
            :operators="['contains']"
            v-model="nameFilter"
            @dismiss="onFilterDismiss('name')"
          />
          <text-filter-pill
            v-if="isFilterVisible('version')"
            ref="filter_version"
            :field-label="$t('message.version')"
            field-name="version"
            icon="fa-bookmark-o"
            :operators="['contains']"
            v-model="versionFilter"
            @dismiss="onFilterDismiss('version')"
          />
          <searchable-multi-select-filter-pill
            v-if="isFilterVisible('classifier')"
            ref="filter_classifier"
            :field-label="$t('message.classifier')"
            field-name="classifier"
            icon="fa-cube"
            :options="sortAvailableClassifiers"
            v-model="classifierFilter"
            @dismiss="onFilterDismiss('classifier')"
          />
          <multi-value-text-filter-pill
            v-if="isFilterVisible('tag')"
            ref="filter_tag"
            :field-label="$t('message.tags')"
            field-name="tag"
            icon="fa-tag"
            :input-placeholder="$t('message.tag_name')"
            v-model="tagFilter"
            @dismiss="onFilterDismiss('tag')"
          />
          <searchable-multi-select-filter-pill
            v-if="isFilterVisible('severity')"
            ref="filter_severity"
            :field-label="$t('message.severity')"
            field-name="severity"
            icon="fa-signal"
            :options="severityFilterOptions"
            v-model="severityFilter"
            @dismiss="onFilterDismiss('severity')"
          />
          <multi-value-text-filter-pill
            v-if="isFilterVisible('team')"
            ref="filter_team"
            :field-label="$t('message.teams')"
            field-name="team"
            icon="fa-users"
            :input-placeholder="$t('message.team_name')"
            v-model="teamFilter"
            @dismiss="onFilterDismiss('team')"
          />
          <searchable-multi-select-filter-pill
            v-if="!uuid && isFilterVisible('ancestor')"
            ref="filter_ancestor"
            :field-label="$t('message.ancestor')"
            field-name="ancestor"
            icon="fa-sitemap"
            :multiple="false"
            :options="ancestorOptions"
            :loading="ancestorOptionsLoading"
            :search-placeholder="$t('message.search_ancestor')"
            v-model="ancestorFilter"
            @dismiss="onFilterDismiss('ancestor')"
          />
          <date-time-range-filter-pill
            v-if="isFilterVisible('lastBomImport')"
            ref="filter_lastBomImport"
            :field-label="$t('message.last_bom_import')"
            field-name="last_bom_import"
            icon="fa-calendar"
            date-only
            emit-date-as-millis
            v-model="lastBomImportFilter"
            @dismiss="onFilterDismiss('lastBomImport')"
          />
          <enum-filter-pill
            v-if="isFilterVisible('active')"
            ref="filter_active"
            :field-label="$t('message.active')"
            field-name="active"
            icon="fa-eye"
            :options="activeFilterOptions"
            v-model="activeFilter"
            @dismiss="onFilterDismiss('active')"
          />
          <enum-filter-pill
            v-if="isFilterVisible('latest')"
            ref="filter_latest"
            :field-label="$t('message.latest')"
            field-name="latest"
            icon="fa-bookmark"
            :options="latestFilterOptions"
            v-model="latestFilter"
            @dismiss="onFilterDismiss('latest')"
          />
          <b-dropdown
            v-if="addFilterOptions.length > 0"
            size="sm"
            variant="outline-primary"
            class="btn-more-filters"
            no-caret
          >
            <template #button-content>
              <span class="fa fa-plus" aria-hidden="true"></span>
              {{ $t('message.add_filter') }}
            </template>
            <b-dropdown-item
              v-for="filter in addFilterOptions"
              :key="filter.name"
              @click="showFilter(filter.name)"
            >
              <span
                :class="['fa', filter.icon, 'mr-2']"
                aria-hidden="true"
              ></span>
              {{ filter.label }}
            </b-dropdown-item>
          </b-dropdown>
          <b-button
            v-show="activeFilterCount >= 2"
            size="sm"
            variant="outline-danger"
            class="btn-clear-all-filters"
            @click="clearAllFilters"
          >
            <span class="fa fa-remove" aria-hidden="true"></span>
            {{ $t('message.clear_filters') }}
          </b-button>
        </div>
      </div>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="tableData"
      :options="options"
      @on-load-success="onLoadSuccess"
      @on-pre-body="onPreBody"
      @on-post-body="onPostBody"
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
          for="project-list-page-size-select"
        >
          {{ $t('message.rows_per_page') }}
        </label>
        <b-form-select
          id="project-list-page-size-select"
          v-model="currentPageSize"
          class="pagination-page-size-select"
          :disabled="isLoading"
        >
          <b-form-select-option
            v-for="pageSize in allowedPageSizes"
            :key="`pageSize-${pageSize}`"
            :value="pageSize"
          >
            {{ pageSize }}
          </b-form-select-option>
        </b-form-select>
      </div>
      <div class="d-flex align-items-center">
        <b-button-group class="pagination-group">
          <b-button
            class="pagination-button"
            :disabled="!hasPreviousPage || isLoading"
            :aria-label="$t('message.first_page')"
            :title="$t('message.first_page')"
            @click="goToFirstPage"
          >
            <i class="fa fa-angle-double-left" aria-hidden="true"></i>
          </b-button>
          <b-button
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
    <project-create-project-modal />
  </div>
</template>

<script>
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';
import { Switch as cSwitch } from '@coreui/vue';
import MurmurHash2 from 'imurmurhash';
import Vue from 'vue';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import filterPillsMixin from '../../../mixins/filterPillsMixin';
import availableClassifiersMixin from '../../../mixins/availableClassifiersMixin';
import common from '../../../shared/common';
import PolicyViolationProgressBar from '../../components/PolicyViolationProgressBar';
import SeverityProgressBar from '../../components/SeverityProgressBar';
import ProjectCreateProjectModal from './ProjectCreateProjectModal';
import TextFilterPill from '@/views/components/TextFilterPill.vue';
import EnumFilterPill from '@/views/components/EnumFilterPill.vue';
import SearchableMultiSelectFilterPill from '@/views/components/SearchableMultiSelectFilterPill.vue';
import MultiValueTextFilterPill from '@/views/components/MultiValueTextFilterPill.vue';
import DateTimeRangeFilterPill from '@/views/components/DateTimeRangeFilterPill.vue';

const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

const EXPAND_BY_COLUMN = {
  'metrics.policy_violations_total': 'metrics',
  'metrics.vulnerabilities': 'metrics',
  teams: 'teams',
};

// Columns that request expand and are visible by default when no preference is stored.
const DEFAULT_VISIBLE_EXPAND_COLUMNS = [
  'metrics.policy_violations_total',
  'metrics.vulnerabilities',
];

const LEGACY_SORT_FIELD_MAP = {
  isLatest: 'is_latest',
  lastBomImport: 'last_bom_import',
  lastRiskScore: 'last_inherited_risk_score',
};

function normalizeSortField(field) {
  if (!field) {
    return field;
  }
  return LEGACY_SORT_FIELD_MAP[field] || field;
}

function storedColumnVisibility(field) {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(
    'ProjectListShow' + common.capitalize(field),
  );
  if (stored === null) {
    return null;
  }
  return stored === 'true';
}

function initialVisibleColumns() {
  return Object.keys(EXPAND_BY_COLUMN).filter((field) => {
    const stored = storedColumnVisibility(field);
    if (stored !== null) {
      return stored;
    }
    return DEFAULT_VISIBLE_EXPAND_COLUMNS.includes(field);
  });
}

// Filters that force flat view; active/latest keep tree view available.
const HEAVY_FILTER_NAMES = [
  'name',
  'version',
  'classifier',
  'tag',
  'severity',
  'team',
  'ancestor',
  'lastBomImport',
];

const DEFAULT_ACTIVE_FILTER = 'true';

export default {
  mixins: [permissionsMixin, filterPillsMixin, availableClassifiersMixin],
  components: {
    cSwitch,
    ProjectCreateProjectModal,
    TextFilterPill,
    EnumFilterPill,
    SearchableMultiSelectFilterPill,
    MultiValueTextFilterPill,
    DateTimeRangeFilterPill,
  },
  props: {
    uuid: String,
  },
  beforeCreate() {
    this.showFlatView =
      localStorage && localStorage.getItem('ProjectListShowFlatView') !== null
        ? localStorage.getItem('ProjectListShowFlatView') === 'true'
        : false;
  },
  beforeMount() {
    this.applyRouteFilters();
  },
  mounted() {
    if (!this.uuid) {
      this.loadAncestorOptions();
    }
    this.resetAndLoad();
  },
  methods: {
    hasFilterValue(name) {
      if (name === 'active') {
        return this.activeFilter === 'true' || this.activeFilter === 'false';
      }
      if (name === 'latest') {
        return this.latestFilter === 'true' || this.latestFilter === 'false';
      }
      const val = this[name + 'Filter'];
      return Array.isArray(val) ? val.length > 0 : !!val;
    },
    onFilterDismiss(name) {
      // Active uses 'all' (show inactive too) instead of null when dismissed.
      if (name === 'active') {
        this.activeFilter = 'all';
      }
      filterPillsMixin.methods.onFilterDismiss.call(this, name);
    },
    showFilter(name) {
      if (name === 'active' && this.activeFilter === 'all') {
        this.activeFilter = DEFAULT_ACTIVE_FILTER;
      }
      filterPillsMixin.methods.showFilter.call(this, name);
    },
    isFilterVisible(name) {
      if (name === 'active') {
        return (
          this.activeFilter === 'true' ||
          this.activeFilter === 'false' ||
          !!this.pendingFilters.active
        );
      }
      return filterPillsMixin.methods.isFilterVisible.call(this, name);
    },
    applyRouteFilters() {
      const q = this.$route.query;
      this.nameFilter = q.name_contains
        ? { operator: 'contains', value: q.name_contains }
        : null;
      this.versionFilter = q.version_contains
        ? { operator: 'contains', value: q.version_contains }
        : null;
      if (q.classifier) {
        this.classifierFilter = Array.isArray(q.classifier)
          ? q.classifier
          : [q.classifier];
      } else {
        this.classifierFilter = null;
      }
      if (q.tags_all) {
        this.tagFilter = Array.isArray(q.tags_all) ? q.tags_all : [q.tags_all];
      } else if (q.tags) {
        this.tagFilter = Array.isArray(q.tags) ? q.tags : [q.tags];
      } else if (q.tag) {
        this.tagFilter = Array.isArray(q.tag) ? q.tag : [q.tag];
      } else {
        this.tagFilter = null;
      }
      if (q.severity) {
        this.severityFilter = Array.isArray(q.severity)
          ? q.severity
          : [q.severity];
      } else {
        this.severityFilter = null;
      }
      if (q.teams_any) {
        this.teamFilter = Array.isArray(q.teams_any)
          ? q.teams_any
          : [q.teams_any];
      } else if (q.teams) {
        this.teamFilter = Array.isArray(q.teams) ? q.teams : [q.teams];
      } else if (q.team) {
        this.teamFilter = Array.isArray(q.team) ? q.team : [q.team];
      } else {
        this.teamFilter = null;
      }
      if (q.last_bom_import_since || q.last_bom_import_before) {
        this.lastBomImportFilter = {
          since: q.last_bom_import_since
            ? Number(q.last_bom_import_since)
            : null,
          before: q.last_bom_import_before
            ? Number(q.last_bom_import_before)
            : null,
        };
      } else {
        this.lastBomImportFilter = null;
      }
      if (q.show_inactive === 'true') {
        this.activeFilter = 'all';
      } else if (q.is_active === 'INACTIVE' || q.is_active === 'false') {
        this.activeFilter = 'false';
      } else if (q.is_active === 'ACTIVE' || q.is_active === 'true') {
        this.activeFilter = 'true';
      } else {
        this.activeFilter = DEFAULT_ACTIVE_FILTER;
      }
      if (q.is_latest === 'false') {
        this.latestFilter = 'false';
      } else if (q.is_latest === 'true') {
        this.latestFilter = 'true';
      } else {
        this.latestFilter = null;
      }
      if (q.ancestor_uuid) {
        this.ancestorFilter = q.ancestor_uuid;
      } else {
        this.ancestorFilter = null;
      }
    },
    initializeProjectCreateProjectModal() {
      this.$root.$emit('initializeProjectCreateProjectModal');
    },
    async loadAncestorOptions() {
      this.ancestorOptionsLoading = true;
      try {
        const baseUrl = common.setQueryParams(
          `${this.$api.BASE_URL}/${this.$api.URL_PROJECTS}`,
          {
            has_children: true,
            is_active: 'ACTIVE',
            limit: 1000,
            sort_by: 'name',
          },
        );
        const items = [];
        let pageUrl = baseUrl;
        while (pageUrl) {
          const response = await this.axios.get(pageUrl);
          items.push(...(response.data.items || []));
          const nextPageToken = response.data.next_page_token;
          pageUrl = nextPageToken
            ? common.setQueryParams(baseUrl, { page_token: nextPageToken })
            : null;
        }
        this.ancestorOptions = items.map((item) => ({
          value: item.uuid,
          text: item.version ? `${item.name} : ${item.version}` : item.name,
        }));
      } catch (err) {
        console.error(`Failed to load ancestor filter options: ${err}`);
        this.ancestorOptions = [];
      } finally {
        this.ancestorOptionsLoading = false;
      }
    },
    projectsUrl() {
      return `${this.$api.BASE_URL}/${this.$api.URL_PROJECTS}`;
    },
    buildFilterParams() {
      const params = {};
      if (this.activeFilter === 'false') {
        params.is_active = 'INACTIVE';
      } else if (this.activeFilter === 'true') {
        params.is_active = 'ACTIVE';
      }
      // 'all': omit is_active to include active and inactive projects.
      if (this.nameFilter?.value) {
        params.name_contains = this.nameFilter.value;
      }
      if (this.versionFilter?.value) {
        params.version_contains = this.versionFilter.value;
      }
      if (this.classifierFilter?.length) {
        params.classifier = [...this.classifierFilter];
      }
      if (this.tagFilter?.length) {
        params.tags_all = [...this.tagFilter];
      }
      if (this.severityFilter?.length) {
        params.severity = [...this.severityFilter];
      }
      if (this.teamFilter?.length) {
        params.teams_any = [...this.teamFilter];
      }
      if (this.latestFilter === 'true') {
        params.is_latest = true;
      } else if (this.latestFilter === 'false') {
        params.is_latest = false;
      }
      if (this.lastBomImportFilter?.since) {
        params.last_bom_import_since = this.lastBomImportFilter.since;
      }
      if (this.lastBomImportFilter?.before) {
        params.last_bom_import_before = this.lastBomImportFilter.before;
      }
      if (this.ancestorFilter) {
        params.ancestor_uuid = this.ancestorFilter;
      }
      return params;
    },
    buildUrlQueryParams() {
      const params = this.buildFilterParams();
      if (this.activeFilter === 'all') {
        params.show_inactive = 'true';
        delete params.is_active;
      } else if (this.activeFilter === 'false') {
        params.is_active = 'INACTIVE';
      } else {
        delete params.is_active;
      }
      if (this.latestFilter === 'true') {
        params.is_latest = 'true';
      } else if (this.latestFilter === 'false') {
        params.is_latest = 'false';
      } else {
        delete params.is_latest;
      }
      return params;
    },
    buildListUrl({ parentUuid, sortBy, sortDirection } = {}) {
      const params = this.buildFilterParams();
      if (sortBy) {
        params.sort_by = sortBy;
      }
      if (sortDirection) {
        params.sort_direction = sortDirection.toUpperCase();
      }
      if (parentUuid) {
        params.parent_uuid = parentUuid;
      } else if (this.uuid && !parentUuid) {
        params.parent_uuid = this.uuid;
      } else if (this.isTreeView) {
        params.only_root = true;
      }
      return common.setQueryParams(this.projectsUrl(), params);
    },
    syncQueryParams() {
      const query = this.buildUrlQueryParams();
      if (!common.sameQueryParams(query, this.$route.query)) {
        this.$router.replace({ query }).catch(() => {});
      }
    },
    clearAllFilters() {
      this._clearing = true;
      try {
        this.nameFilter = null;
        this.versionFilter = null;
        this.classifierFilter = null;
        this.tagFilter = null;
        this.severityFilter = null;
        this.teamFilter = null;
        this.ancestorFilter = null;
        this.lastBomImportFilter = null;
        this.activeFilter = 'all';
        this.latestFilter = null;
        this.clearPendingFilters();
      } finally {
        this._clearing = false;
      }
      this.syncQueryParams();
    },
    refreshTable() {
      this.syncQueryParams();
      this.resetAndLoad();
    },
    emitVisibleColumns() {
      if (!this.$refs.table) {
        return;
      }
      this.visibleColumns = this.$refs.table
        .getVisibleColumns()
        .map((column) => column.field);
    },
    async refreshCurrentPage() {
      if (this.currentPageUrl === null) {
        await this.resetAndLoad();
        return;
      }
      await this.loadPage(this.currentPageUrl);
    },
    async loadPage(pageUrl) {
      this.$refs.table.showLoading();
      this.isLoading = true;
      const requestId = ++this.currentRequestId;

      try {
        const fetchUrl = common.setQueryParams(pageUrl, {
          ...this.expandQueryParams,
          limit: this.currentPageSize,
        });
        const response = await this.axios.get(fetchUrl);
        if (requestId !== this.currentRequestId) {
          return;
        }

        this.tableData = response.data.items || [];
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
      } catch (err) {
        if (requestId !== this.currentRequestId) {
          return;
        }
        console.error(`Failed to load projects: ${err}`);
        this.tableData = [];
        this.currentPageNumber = 1;
        this.currentPageUrl = null;
        this.nextPageUrl = null;
        this.pageUrlHistory = [];
        this.totalCount = null;
        this.totalCountType = null;
      } finally {
        if (requestId === this.currentRequestId) {
          this.$refs.table.hideLoading();
          this.isLoading = false;
        }
      }
    },
    async resetAndLoad() {
      this.currentPageNumber = 1;
      this.pageUrlHistory = [];
      this.nextPageUrl = null;
      this.totalCount = null;
      this.totalCountType = null;
      await this.loadPage(
        this.buildListUrl({
          sortBy: this.sortBy,
          sortDirection: this.sortDirection,
        }),
      );
    },
    async goToFirstPage() {
      if (!this.hasPreviousPage) {
        return;
      }
      await this.resetAndLoad();
    },
    async goToPrevPage() {
      if (!this.hasPreviousPage) {
        return;
      }
      this.currentPageNumber--;
      if (this.currentPageNumber === 1) {
        this.pageUrlHistory = [];
        await this.loadPage(
          this.buildListUrl({
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
          }),
        );
      } else {
        const prevPageUrl = this.pageUrlHistory.pop();
        await this.loadPage(prevPageUrl);
      }
    },
    async goToNextPage() {
      if (!this.hasNextPage) {
        return;
      }
      this.pageUrlHistory.push(this.currentPageUrl);
      this.currentPageNumber++;
      await this.loadPage(this.nextPageUrl);
    },
    onLoadSuccess() {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectList',
        this.$refs.table.columns,
      );
      this.emitVisibleColumns();
    },
    onPreBody() {
      this.$refs.table.getData().forEach((project) => {
        project.id = MurmurHash2(project.uuid).result();
      });
    },
    onPostBody() {
      if (this.isTreeView) {
        const columns = this.$refs.table.getOptions().columns;
        if (columns && columns[0][0].visible) {
          this.$refs.table.$table.treegrid({
            treeColumn: 0,
            initialState: 'collapsed',
          });
        }
        this.$refs.table.getData().forEach((project) => {
          if (project.fetchedChildren) {
            return;
          }

          const renderExpander = () => {
            this.$refs.table.$table
              .find('tbody')
              .find('tr.treegrid-' + project.id.toString())
              .addClass('treegrid-collapsed')
              .treegrid('renderExpander');
          };

          if (project.matchesChildSearch) {
            renderExpander();
            return;
          }

          if (project.checkedHasChildren) {
            return;
          }
          project.checkedHasChildren = true;

          this.hasMatchingChildren(project).then((doesHaveMatchingChildren) => {
            project.matchesChildSearch = doesHaveMatchingChildren;
            if (doesHaveMatchingChildren) {
              renderExpander();
            }
          });
        });
        this.$refs.table.getData().forEach((row) => {
          if (row.expanded) {
            this.$refs.table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.id.toString())
              .treegrid('expand');
          } else if (row.expanded === false) {
            this.$refs.table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.id.toString())
              .treegrid('collapse');
          }
        });
      }
      this.$refs.table.hideLoading();
    },
    async getChildren(parentProject) {
      const url = this.buildListUrl({ parentUuid: parentProject.uuid });
      const response = await this.axios.get(
        common.setQueryParams(url, {
          ...this.expandQueryParams,
          limit: 100,
        }),
      );
      const children = (response.data.items || []).map((item) => ({
        ...item,
        pid: MurmurHash2(parentProject.uuid).result(),
      }));
      this.$refs.table.append(children);
    },
    async hasMatchingChildren(project) {
      if (!project.has_children) {
        return false;
      }
      const url = this.buildListUrl({ parentUuid: project.uuid });
      const response = await this.axios.get(
        common.setQueryParams(url, { limit: 1 }),
      );
      return (response.data.total?.count ?? 0) > 0;
    },
    saveViewState() {
      this.savedViewState = this.showFlatView;
    },
  },
  watch: {
    activeFilter(value) {
      if (value === null) {
        this.activeFilter = 'all';
      }
    },
    '$route.fullPath'(newPath, oldPath) {
      if (newPath === oldPath) {
        return;
      }
      const expected = this.buildUrlQueryParams();
      if (common.sameQueryParams(expected, this.$route.query)) {
        return;
      }
      this.applyRouteFilters();
      this.resetAndLoad();
    },
    showFlatView(value) {
      if (localStorage) {
        localStorage.setItem('ProjectListShowFlatView', value.toString());
      }
      this.resetAndLoad();
    },
    hasListFilters(active) {
      if (active && this.isTreeViewAllowed) {
        this.showFlatView = true;
      } else if (!active && this.savedViewState !== null) {
        this.showFlatView = this.savedViewState;
      } else if (!active) {
        this.showFlatView = false;
      }
    },
    currentPageSize(size) {
      if (localStorage) {
        localStorage.setItem('ProjectListPageSize', String(size));
      }
      this.resetAndLoad();
    },
    expandQueryParams(newVal, oldVal) {
      if (this.currentPageUrl === null) {
        return;
      }
      if (common.sameQueryParams(newVal, oldVal)) {
        return;
      }
      if (this.expandParamsTimer) {
        clearTimeout(this.expandParamsTimer);
      }
      this.expandParamsTimer = setTimeout(() => {
        this.refreshCurrentPage();
      }, 300);
    },
  },
  beforeDestroy() {
    if (this.expandParamsTimer) {
      clearTimeout(this.expandParamsTimer);
    }
  },
  computed: {
    expandQueryParams() {
      const expand = new Set();
      for (const field of this.visibleColumns) {
        if (EXPAND_BY_COLUMN[field]) {
          expand.add(EXPAND_BY_COLUMN[field]);
        }
      }
      if (expand.size === 0) {
        return {};
      }
      return { expand: [...expand] };
    },
    allFilterDefs() {
      return [
        {
          name: 'name',
          label: this.$t('message.project_name'),
          icon: 'fa-folder-open-o',
        },
        {
          name: 'version',
          label: this.$t('message.version'),
          icon: 'fa-bookmark-o',
        },
        {
          name: 'classifier',
          label: this.$t('message.classifier'),
          icon: 'fa-cube',
        },
        { name: 'tag', label: this.$t('message.tags'), icon: 'fa-tag' },
        {
          name: 'severity',
          label: this.$t('message.severity'),
          icon: 'fa-signal',
        },
        { name: 'team', label: this.$t('message.teams'), icon: 'fa-users' },
        ...(!this.uuid
          ? [
              {
                name: 'ancestor',
                label: this.$t('message.ancestor'),
                icon: 'fa-sitemap',
              },
            ]
          : []),
        {
          name: 'lastBomImport',
          label: this.$t('message.last_bom_import'),
          icon: 'fa-calendar',
        },
        {
          name: 'active',
          label: this.$t('message.active'),
          icon: 'fa-eye',
        },
        {
          name: 'latest',
          label: this.$t('message.latest'),
          icon: 'fa-bookmark',
        },
      ];
    },
    hasListFilters() {
      return HEAVY_FILTER_NAMES.some((name) => this.hasFilterValue(name));
    },
    activeFilterOptions() {
      return [
        { value: 'true', text: this.$t('message.filter_only_active') },
        { value: 'false', text: this.$t('message.filter_only_inactive') },
      ];
    },
    latestFilterOptions() {
      return [
        { value: 'true', text: this.$t('message.filter_only_latest') },
        { value: 'false', text: this.$t('message.filter_only_non_latest') },
      ];
    },
    severityFilterOptions() {
      return [
        { text: this.$t('severity.critical'), value: 'CRITICAL' },
        { text: this.$t('severity.high'), value: 'HIGH' },
        { text: this.$t('severity.medium'), value: 'MEDIUM' },
        { text: this.$t('severity.low'), value: 'LOW' },
        { text: this.$t('severity.unassigned'), value: 'UNASSIGNED' },
      ];
    },
    isTreeViewAllowed() {
      return !this.uuid && !this.hasListFilters;
    },
    isTreeView() {
      return this.isTreeViewAllowed && !this.showFlatView;
    },
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
  data() {
    let currentPageSize = 10;
    if (typeof localStorage !== 'undefined') {
      const stored = Number(localStorage.getItem('ProjectListPageSize'));
      if (ALLOWED_PAGE_SIZES.includes(stored)) {
        currentPageSize = stored;
      }
    }
    return {
      showFlatView: this.showFlatView,
      savedViewState: null,
      nameFilter: null,
      versionFilter: null,
      classifierFilter: null,
      tagFilter: null,
      severityFilter: null,
      teamFilter: null,
      ancestorFilter: null,
      ancestorOptions: [],
      ancestorOptionsLoading: false,
      lastBomImportFilter: null,
      activeFilter: DEFAULT_ACTIVE_FILTER,
      latestFilter: null,
      sortBy: normalizeSortField(
        localStorage && localStorage.getItem('ProjectListSortName') !== null
          ? localStorage.getItem('ProjectListSortName')
          : 'name',
      ),
      sortDirection:
        localStorage && localStorage.getItem('ProjectListSortOrder') !== null
          ? localStorage.getItem('ProjectListSortOrder')
          : 'asc',
      tableData: [],
      visibleColumns: initialVisibleColumns(),
      expandParamsTimer: null,
      currentPageNumber: 1,
      currentPageSize,
      allowedPageSizes: ALLOWED_PAGE_SIZES,
      currentPageUrl: null,
      nextPageUrl: null,
      pageUrlHistory: [],
      currentRequestId: 0,
      isLoading: false,
      totalCount: null,
      totalCountType: null,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      columns: [
        {
          title: this.$t('message.project_name'),
          field: 'name',
          sortable: true,
          routerFunc: () => this.$router,
          $t: (key, values) => this.$t(key, values),
          formatter(value, row) {
            let url = xssFilters.uriInUnQuotedAttr(
              this.routerFunc().resolve({
                name: 'Project',
                params: { uuid: row.uuid },
              }).route.fullPath,
            );
            let collectionIcon = '';
            if (row.collection_logic) {
              const title = common.getCollectionLogicText(this, row);
              collectionIcon = ` <i class="fa fa-calculator fa-fw icon-cellend" title="${title}"></i>`;
            }
            return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>${collectionIcon}`;
          },
        },
        {
          title: this.$t('message.tags'),
          field: 'tags',
          sortable: false,
          visible: false,
          routerFunc: () => this.$router,
          formatter(value, row) {
            const router = this.routerFunc();
            let tag_string = '';
            if (row.tags) {
              tag_string =
                row.tags
                  ?.slice(0, 2)
                  .map((tag) => common.formatProjectTagLabel(router, tag))
                  .join(' ') || '';
              if (row.tags.length > 2) {
                tag_string += ` <span class="d-none">`;
                tag_string += row.tags
                  .slice(2)
                  ?.map((tag) => common.formatProjectTagLabel(router, tag))
                  .join(' ');
                tag_string += `</span>`;
                tag_string += `<a href="#" title="show all tags" class="badge badge-tag" onclick="this.previousElementSibling.classList.toggle('d-none')">…</a>`;
              }
            }
            return tag_string;
          },
        },
        {
          title: this.$t('message.teams'),
          field: 'teams',
          sortable: false,
          visible: storedColumnVisibility('teams') === true,
          routerFunc: () => this.$router,
          formatter(value, row) {
            const router = this.routerFunc();
            let team_string = '';
            if (row.teams) {
              team_string =
                row.teams
                  ?.slice(0, 2)
                  .map((teams) => common.formatProjectTeamLabel(router, teams))
                  .join(' ') || '';
              if (row.teams.length > 2) {
                team_string += ` <span class="d-none">`;
                team_string += row.teams
                  .slice(2)
                  ?.map((teams) => common.formatProjectTeamLabel(router, teams))
                  .join(' ');
                team_string += `</span>`;
                team_string += `<a href="#" title="show all teams" class="badge badge-team" onclick="this.previousElementSibling.classList.toggle('d-none')">…</a>`;
              }
            }
            return team_string;
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.latest'),
          field: 'is_latest',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
          align: 'center',
          sortable: true,
        },
        {
          title: this.$t('message.classifier'),
          field: 'classifier',
          sortable: true,
          routerFunc: () => this.$router,
          formatter: common.componentClassifierLabelProjectUrlFormatter(this),
        },
        {
          title: this.$t('message.last_bom_import'),
          field: 'last_bom_import',
          sortable: true,
          formatter(timestamp) {
            return typeof timestamp === 'number'
              ? common.formatTimestamp(timestamp, false)
              : '-';
          },
        },
        {
          title: this.$t('message.bom_format'),
          field: 'last_bom_import_format',
          sortable: false,
        },
        {
          title: this.$t('message.risk_score'),
          field: 'last_inherited_risk_score',
          sortable: true,
        },
        {
          title: this.$t('message.active'),
          field: 'is_active',
          formatter(value) {
            return value === 'ACTIVE' || value === true
              ? '<i class="fa fa-check-square-o" />'
              : '';
          },
          align: 'center',
          sortable: false,
        },
        {
          title: this.$t('message.policy_violations'),
          field: 'metrics.policy_violations_total',
          formatter: function (_, row) {
            let metrics = row.metrics;
            if (typeof metrics === 'undefined') {
              return '-';
            }
            let ComponentClass = Vue.extend(PolicyViolationProgressBar);
            let progressBar = new ComponentClass({
              propsData: {
                metrics,
                $t: this.$t.bind(this),
              },
            });
            progressBar.$mount();
            return progressBar.$el.outerHTML;
          }.bind(this),
        },
        {
          title: this.$t('message.vulnerabilities'),
          field: 'metrics.vulnerabilities',
          sortable: false,
          formatter: function (_, row) {
            let metrics = row.metrics;
            if (typeof metrics === 'undefined') {
              return '-';
            }
            let ComponentClass = Vue.extend(SeverityProgressBar);
            let progressBar = new ComponentClass({
              propsData: {
                vulnerabilities: metrics.vulnerabilities,
                critical: metrics.critical,
                high: metrics.high,
                medium: metrics.medium,
                low: metrics.low,
                unassigned: metrics.unassigned,
                $t: this.$t.bind(this),
              },
            });
            progressBar.$mount();
            return progressBar.$el.outerHTML;
          }.bind(this),
        },
      ],
      options: {
        idField: 'id',
        parentIdField: 'pid',
        treeShowField: 'name',
        search: false,
        showColumns: true,
        showRefresh: true,
        pagination: false,
        silentSort: false,
        sortName: normalizeSortField(
          localStorage && localStorage.getItem('ProjectListSortName') !== null
            ? localStorage.getItem('ProjectListSortName')
            : 'name',
        ),
        sortOrder:
          localStorage && localStorage.getItem('ProjectListSortOrder') !== null
            ? localStorage.getItem('ProjectListSortOrder')
            : 'asc',
        icons: {
          refresh: 'fa-refresh',
        },
        toolbar: '#projectsFilterBarRow',
        customSort: () => {},
        onClickRow: (row, $element) => {
          if (!this.isTreeView) {
            return;
          }
          if (
            event.target.tagName.toLowerCase() !== 'a' &&
            $element.treegrid('isLeaf') &&
            row.has_children &&
            !row.fetchedChildren
          ) {
            row.fetchedChildren = true;
            this.getChildren(row);
            row.expanded = true;
          } else if (
            event.target.tagName.toLowerCase() !== 'a' &&
            ((!$element.treegrid('isLeaf') &&
              $element.treegrid('isCollapsed') &&
              event.target.className !==
                'treegrid-expander treegrid-expander-collapsed') ||
              event.target.className ===
                'treegrid-expander treegrid-expander-expanded')
          ) {
            $element.treegrid('expand');
            row.expanded = true;
          } else if (
            event.target.tagName.toLowerCase() !== 'a' &&
            ((!$element.treegrid('isLeaf') &&
              $element.treegrid('isExpanded') &&
              event.target.className !==
                'treegrid-expander treegrid-expander-expanded') ||
              event.target.className ===
                'treegrid-expander treegrid-expander-collapsed')
          ) {
            $element.treegrid('collapse');
            row.expanded = false;
          }
        },
        onRefresh: () => {
          this.refreshTable();
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectListShow' + common.capitalize(field),
              checked.toString(),
            );
          }
          this.emitVisibleColumns();
        },
        onColumnSwitchAll: () => {
          this.emitVisibleColumns();
        },
        onSort: (name, order) => {
          this.sortBy = name;
          this.sortDirection = order;
          if (localStorage) {
            localStorage.setItem('ProjectListSortName', name);
            localStorage.setItem('ProjectListSortOrder', order);
          }
          this.resetAndLoad();
        },
      },
    };
  },
};
</script>

<style scoped src="@/views/components/filter-pills.css"></style>
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

.filter-bar-surface {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 6px;
  background: rgb(255 255 255 / 5%);
}

.pagination-button {
  position: relative;
  display: block;
  padding: $pagination-padding-y 1.25rem;
  margin-left: -$pagination-border-width;
  line-height: $pagination-line-height;
  color: $pagination-color;
  background-color: $pagination-bg;
  border: $pagination-border-width solid $pagination-border-color;

  &:disabled {
    z-index: 2;
    color: $pagination-disabled-color;
    background-color: $pagination-disabled-bg;
    border-color: $pagination-disabled-border-color;
  }

  &:not(:disabled):hover {
    z-index: 2;
    color: $pagination-hover-color;
    background-color: $pagination-hover-bg;
    border-color: $pagination-hover-border-color;
  }
}
</style>
