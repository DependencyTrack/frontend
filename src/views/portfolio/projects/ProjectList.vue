<template>
  <div>
    <b-button
      variant="primary"
      class="mb-2"
      @click="initializeProjectCreateProjectModal"
      v-permission:or="[
        PERMISSIONS.PORTFOLIO_MANAGEMENT,
        PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
      ]"
    >
      <span class="fa fa-plus" aria-hidden="true"></span>
      {{ $t('message.create_project') }}
    </b-button>
    <filter-bar
      toolbar-id="projectsToolbar"
      :add-filter-options="addFilterOptions"
      :active-filter-count="activeFilterCount"
      @show-filter="showFilter"
      @clear-all="clearAllFilters"
    >
      <text-filter-pill
        v-if="isFilterVisible('name')"
        ref="filter_name"
        :field-label="$t('message.name')"
        field-name="name"
        icon="fa-folder-open-o"
        operator="contains"
        v-model="nameFilter"
        @dismiss="onFilterDismiss('name')"
      />
      <text-filter-pill
        v-if="isFilterVisible('version')"
        ref="filter_version"
        :field-label="$t('message.version')"
        field-name="version"
        icon="fa-bookmark-o"
        operator="contains"
        v-model="versionFilter"
        @dismiss="onFilterDismiss('version')"
      />
      <multi-select-filter-pill
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
      <project-filter-pill
        v-if="!uuid && isFilterVisible('ancestor')"
        ref="filter_ancestor"
        :field-label="$t('message.ancestor')"
        field-name="ancestor"
        icon="fa-sitemap"
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
      <boolean-filter-pill
        v-if="isFilterVisible('showInactive')"
        :field-label="$t('message.show_inactive')"
        field-name="showInactive"
        icon="fa-eye"
        v-model="showInactive"
      />
      <boolean-filter-pill
        v-if="isFilterVisible('onlyLatestVersion')"
        :field-label="$t('message.only_latest')"
        field-name="onlyLatestVersion"
        icon="fa-bookmark"
        v-model="onlyLatestVersion"
      />
      <template #actions>
        <b-button-group :aria-label="$t('message.view')">
          <!-- aria-disabled instead of disabled keeps the button focusable and hoverable, so its reason can show. -->
          <b-button
            variant="outline-primary"
            class="py-1"
            :pressed="isTreeView"
            :aria-disabled="isTreeViewAllowed ? null : 'true'"
            :class="{ 'opacity-50': !isTreeViewAllowed }"
            v-b-tooltip.hover.focus="
              isTreeViewAllowed ? '' : $t('message.tree_view_unavailable')
            "
            :aria-describedby="
              isTreeViewAllowed ? null : 'project-tree-view-unavailable'
            "
            @update:pressed="isTreeViewAllowed && (showFlatView = false)"
            ><span class="fa fa-indent me-1" aria-hidden="true"></span
            >{{ $t('message.tree') }}</b-button
          >
          <b-button
            variant="outline-primary"
            class="py-1"
            :pressed="!isTreeView"
            @update:pressed="isTreeViewAllowed && (showFlatView = true)"
            ><span class="fa fa-bars me-1" aria-hidden="true"></span
            >{{ $t('message.flat') }}</b-button
          >
        </b-button-group>
        <span
          v-if="!isTreeViewAllowed"
          id="project-tree-view-unavailable"
          class="visually-hidden"
          >{{ $t('message.tree_view_unavailable') }}</span
        >
      </template>
    </filter-bar>
    <token-paginated-table
      ref="table"
      :base-url="listUrl"
      :extra-query-params="expandQueryParams"
      :columns="columns"
      :options="options"
      page-size-storage-key="ProjectListPageSize"
      @visible-columns="visibleColumns = $event"
    />
    <project-create-project-modal v-model="showProjectCreateProjectModal" />
  </div>
</template>

<script>
import xssFilters from 'xss-filters';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import permissionsMixin from '../../../mixins/permissionsMixin';
import filterPillsMixin from '../../../mixins/filterPillsMixin';
import availableClassifiersMixin from '../../../mixins/availableClassifiersMixin';
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import PolicyViolationProgressBar from '../../components/PolicyViolationProgressBar.vue';
import SeverityProgressBar from '../../components/SeverityProgressBar.vue';
import ProjectCreateProjectModal from './ProjectCreateProjectModal.vue';
import FilterBar from '@/views/components/FilterBar.vue';
import TextFilterPill from '@/views/components/TextFilterPill.vue';
import BooleanFilterPill from '@/views/components/BooleanFilterPill.vue';
import MultiSelectFilterPill from '@/views/components/MultiSelectFilterPill.vue';
import ProjectFilterPill from '@/views/components/ProjectFilterPill.vue';
import MultiValueTextFilterPill from '@/views/components/MultiValueTextFilterPill.vue';
import DateTimeRangeFilterPill from '@/views/components/DateTimeRangeFilterPill.vue';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';

const EXPAND_BY_COLUMN = {
  'metrics.policy_violations_total': 'metrics',
  'metrics.vulnerabilities': 'metrics',
  'metrics.kev': 'metrics',
  'metrics.components': 'metrics',
  teams: 'teams',
};

// Column fields as saved in sort and column preferences before the switch to the v2 API.
const LEGACY_FIELDS = {
  isLatest: 'is_latest',
  lastBomImport: 'last_bom_import',
  lastBomImportFormat: 'last_bom_import_format',
  lastRiskScore: 'last_inherited_risk_score',
  active: 'state',
  'metrics.policyViolationsTotal': 'metrics.policy_violations_total',
};

const CHILDREN_PAGE_SIZE = 25;

export default {
  mixins: [
    bootstrapTableMixin,
    permissionsMixin,
    filterPillsMixin,
    availableClassifiersMixin,
  ],
  components: {
    FilterBar,
    ProjectCreateProjectModal,
    TextFilterPill,
    BooleanFilterPill,
    MultiSelectFilterPill,
    ProjectFilterPill,
    MultiValueTextFilterPill,
    DateTimeRangeFilterPill,
    TokenPaginatedTable,
  },
  props: {
    // If only children from a specific project shall be shown,
    // this must be set to the corresponding project.
    uuid: String,
  },
  created() {
    this.applyRouteFilters();
    const storedVisibility = (field) =>
      localStorage.getItem('ProjectListShow' + common.capitalize(field));
    this.columns.forEach((column) => {
      const legacyField = Object.keys(LEGACY_FIELDS).find(
        (legacy) => LEGACY_FIELDS[legacy] === column.field,
      );
      const stored =
        storedVisibility(column.field) ??
        (legacyField ? storedVisibility(legacyField) : null);
      if (stored !== null) {
        column.visible = stored === 'true';
      }
    });
    this.visibleColumns = this.columns
      .filter((column) => column.visible !== false)
      .map((column) => column.field);
    if (!this.columns.some((c) => c.sortable && c.field === this.sortBy)) {
      this.sortBy = 'name';
    }
    this.options.sortName = this.sortBy;
    this.options.sortOrder = this.sortDirection;
  },
  methods: {
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
        this.classifierFilter = [];
      }
      if (q.tags_all) {
        this.tagFilter = Array.isArray(q.tags_all) ? q.tags_all : [q.tags_all];
      } else if (q.tag) {
        this.tagFilter = Array.isArray(q.tag) ? q.tag : [q.tag];
      } else {
        this.tagFilter = null;
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
      this.showInactive = q.show_inactive === 'true';
      this.onlyLatestVersion = q.is_latest === 'true';
      if (q.ancestor_uuid) {
        this.ancestorFilter = q.ancestor_uuid;
      } else {
        this.ancestorFilter = null;
      }
    },
    initializeProjectCreateProjectModal: function () {
      EventBus.emit('initializeProjectCreateProjectModal');
    },
    buildFilterParams() {
      const params = {};
      if (!this.showInactive) {
        params.state = 'ACTIVE';
      }
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
      if (this.onlyLatestVersion) {
        params.is_latest = true;
      }
      if (this.lastBomImportFilter?.since) {
        params.last_bom_import_since = this.lastBomImportFilter.since;
      }
      if (this.lastBomImportFilter?.before) {
        params.last_bom_import_before = this.lastBomImportFilter.before;
      }
      if (this.ancestorFilter && !this.uuid) {
        params.ancestor_uuid = this.ancestorFilter;
      }
      return params;
    },
    buildUrlQueryParams() {
      const params = this.buildFilterParams();
      delete params.state;
      if (this.showInactive) {
        params.show_inactive = 'true';
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
      } else if (this.uuid) {
        params.parent_uuid = this.uuid;
      } else if (this.isTreeView) {
        params.only_root = true;
      }
      return common.setQueryParams(
        `${this.$api.BASE_URL}/${this.$api.URL_PROJECTS}`,
        params,
      );
    },
    refreshTable() {
      const query = this.buildUrlQueryParams();
      if (!common.sameQueryParams(query, this.$route.query)) {
        this.$router.replace({ query }).catch(() => {});
      }
    },
    innerBootstrapTable() {
      return this.$refs.table?.$refs.table;
    },
    onPostBody: function () {
      this.mountCells();
      const table = this.innerBootstrapTable();
      if (table && this.isTreeView) {
        const columns = table.getOptions().columns;
        if (columns && columns[0][0].visible) {
          table.$table.treegrid({
            treeColumn: 0,
            initialState: 'collapsed',
          });
        }
        table.getData().forEach((project) => {
          // Expander is rendered natively by treegrid when children are
          // already loaded. No extra logic needed.
          if (project.fetchedChildren) {
            return;
          }

          const renderExpander = () => {
            this.innerBootstrapTable()
              ?.$table.find('tbody')
              .find('tr.treegrid-' + project.uuid)
              .addClass('treegrid-collapsed')
              .treegrid('renderExpander');
          };

          // Pre-flight result already known to be positive. Just render
          // the expander, since the tbody was just rebuilt and dropped it.
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
        table.getData().forEach((row) => {
          if (row.expanded) {
            table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.uuid)
              .treegrid('expand');
          } else if (row.expanded === false) {
            table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.uuid)
              .treegrid('collapse');
          }
          if (row.loadMore) {
            const cells = table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.uuid)
              .children('td');
            cells.first().attr('colspan', cells.length);
            cells.slice(1).hide();
          }
        });
      }
    },
    async getChildren(parentUuid, pageUrl) {
      const url =
        pageUrl ??
        common.setQueryParams(this.buildListUrl({ parentUuid }), {
          ...this.expandQueryParams,
          limit: CHILDREN_PAGE_SIZE,
        });
      const response = await this.axios.get(url);
      const table = this.innerBootstrapTable();
      if (!table) {
        return;
      }
      const rows = (response.data.items || []).map((item) => ({
        ...item,
        pid: parentUuid,
      }));
      const nextPageToken = response.data.next_page_token;
      if (nextPageToken) {
        rows.push({
          uuid: `${parentUuid}-more`,
          pid: parentUuid,
          loadMore: common.setQueryParams(url, { page_token: nextPageToken }),
        });
      }
      table.append(rows);
    },
    hasMatchingChildren: function (project) {
      if (!project.has_children) {
        return Promise.resolve(false);
      }

      // Perform a pre-flight search if there is at least one
      // child project that matches the current search criteria,
      // and is accessible to the user.
      //
      // While this *does* result in an additional request per project
      // with hasChildren=true, it's still better than returning child
      // data in the project list response.
      let url = this.buildListUrl({ parentUuid: project.uuid });
      return this.axios
        .get(common.setQueryParams(url, { limit: 1 }))
        .then((response) => response.data.total.count > 0);
    },
  },
  watch: {
    $route(newRoute, oldRoute) {
      if (newRoute.path !== oldRoute.path) {
        return;
      }
      const expected = this.buildUrlQueryParams();
      if (common.sameQueryParams(expected, this.$route.query)) {
        return;
      }
      this.applyRouteFilters();
    },
    showFlatView(value) {
      localStorage.setItem('ProjectListShowFlatView', value.toString());
    },
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
          label: this.$t('message.name'),
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
          name: 'showInactive',
          label: this.$t('message.show_inactive'),
          icon: 'fa-eye',
        },
        {
          name: 'onlyLatestVersion',
          label: this.$t('message.only_latest'),
          icon: 'fa-bookmark',
        },
      ];
    },
    listUrl() {
      return this.buildListUrl({
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
      });
    },
    isTreeViewAllowed() {
      // In tree view the API applies filters to root projects only, which would hide matching children.
      // A collection's tab lists its direct children either way, so the tree hides nothing there.
      return (
        !!this.uuid ||
        !this.allFilterDefs.some(
          ({ name }) => name !== 'showInactive' && this.hasFilterValue(name),
        )
      );
    },
    isTreeView() {
      return this.isTreeViewAllowed && !this.showFlatView;
    },
  },
  data() {
    const storedSortName = localStorage.getItem('ProjectListSortName');
    return {
      showProjectCreateProjectModal: false,
      showFlatView: localStorage.getItem('ProjectListShowFlatView') === 'true',
      nameFilter: null,
      versionFilter: null,
      classifierFilter: [],
      tagFilter: null,
      ancestorFilter: null,
      lastBomImportFilter: null,
      showInactive: false,
      onlyLatestVersion: false,
      booleanFilters: ['showInactive', 'onlyLatestVersion'],
      sortBy: LEGACY_FIELDS[storedSortName] ?? storedSortName ?? 'name',
      sortDirection: localStorage.getItem('ProjectListSortOrder') ?? 'asc',
      visibleColumns: [],
      columns: [
        {
          title: this.$t('message.project_name'),
          field: 'name',
          sortable: true,
          routerFunc: () => this.$router,
          $t: (key, values) => this.$t(key, values),
          formatter(value, row) {
            if (row.loadMore) {
              return `<button type="button" class="btn btn-link btn-sm p-0">${xssFilters.inHTMLData(this.$t('message.show_more'))}</button>`;
            }
            let url = xssFilters.uriInUnQuotedAttr(
              this.routerFunc().resolve({
                name: 'Project',
                params: { uuid: row.uuid },
              }).fullPath,
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
          routerFunc: () => this.$router, // Injecting $router directly causes recursion errors in Vue...
          formatter(_value, row) {
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
                tag_string += `<a href="#" title="show all tags" class="badge text-bg-tag" onclick="this.previousElementSibling.classList.toggle('d-none')">…</a>`;
              }
            }
            return tag_string;
          },
        },
        {
          title: this.$t('message.teams'),
          field: 'teams',
          sortable: false,
          visible: false,
          formatter(_value, row) {
            let team_string = '';
            if (row.teams) {
              team_string =
                row.teams
                  ?.slice(0, 2)
                  .map((teams) => common.formatProjectTeamLabel(teams))
                  .join(' ') || '';
              if (row.teams.length > 2) {
                team_string += ` <span class="d-none">`;
                team_string += row.teams
                  .slice(2)
                  ?.map((teams) => common.formatProjectTeamLabel(teams))
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
          sortable: false,
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
          sortable: false,
          visible: false,
        },
        {
          title: this.$t('message.classifier'),
          field: 'classifier',
          sortable: false,
          routerFunc: () => this.$router,
          formatter: common.componentClassifierLabelProjectUrlFormatter(this),
        },
        {
          title: this.$t('message.last_bom_import'),
          field: 'last_bom_import',
          sortable: true,
          formatter(timestamp) {
            return typeof timestamp === 'number'
              ? common.formatTimestamp(timestamp, true)
              : '-';
          },
        },
        {
          title: this.$t('message.bom_format'),
          field: 'last_bom_import_format',
          sortable: false,
          visible: false,
        },
        {
          title: this.$t('message.risk_score'),
          field: 'last_inherited_risk_score',
          sortable: true,
        },
        {
          title: this.$t('message.active'),
          field: 'state',
          formatter(value) {
            return value === 'ACTIVE'
              ? '<i class="fa fa-check-square-o" />'
              : '';
          },
          align: 'center',
          sortable: false,
        },
        {
          title: this.$t('message.components'),
          field: 'metrics.components',
          sortable: false,
          visible: false,
        },
        {
          title: this.$t('message.policy_violations'),
          field: 'metrics.policy_violations_total', // this column uses other fields, but the field id must be unique
          formatter: function (_, row) {
            let metrics = row.metrics;
            if (typeof metrics === 'undefined') {
              return '-'; // No vulnerability info available
            }
            return this.cell(PolicyViolationProgressBar, { metrics });
          }.bind(this),
        },
        {
          title: this.$t('message.vulnerabilities'),
          field: 'metrics.vulnerabilities', // this column uses other fields, but the field id must be unique
          sortable: false,
          formatter: function (_, row) {
            let metrics = row.metrics;
            if (typeof metrics === 'undefined') {
              return '-'; // No vulnerability info available
            }

            return this.cell(SeverityProgressBar, {
              vulnerabilities: metrics.vulnerabilities,
              critical: metrics.critical,
              high: metrics.high,
              medium: metrics.medium,
              low: metrics.low,
              unassigned: metrics.unassigned,
            });
          }.bind(this),
        },
        {
          title: this.$t('message.kev'),
          field: 'metrics.kev',
          sortable: false,
          align: 'center',
          formatter(value) {
            return value > 0
              ? `<span class="text-danger fw-bold">${Number(value)}</span>`
              : value;
          },
        },
      ],
      options: {
        idField: 'uuid',
        parentIdField: 'pid',
        treeShowField: 'name',
        toolbar: '#projectsToolbar',
        onPostBody: () => this.onPostBody(),
        // onClickRow is used instead of a tree node's onExpand event, because onExpand does not pass any arguments and therefore makes it complicated to retrieve a row's data which is needed for fetching its children and appending the data
        onClickRow: (row, $element) => {
          if (this.isTreeView) {
            if (row.loadMore) {
              const table = this.innerBootstrapTable();
              table.remove({ field: 'uuid', values: [row.uuid] });
              this.getChildren(row.pid, row.loadMore).catch(() =>
                table.append([row]),
              );
            } else if (
              event.target.tagName.toLowerCase() !== 'a' &&
              $element.treegrid('isLeaf') &&
              row.has_children &&
              !row.fetchedChildren
            ) {
              row.fetchedChildren = true;
              this.getChildren(row.uuid).catch(() => {
                row.fetchedChildren = false;
              });
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
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectListShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          this.sortBy = name;
          this.sortDirection = order;
          if (localStorage) {
            localStorage.setItem('ProjectListSortName', name);
            localStorage.setItem('ProjectListSortOrder', order);
          }
        },
      },
    };
  },
};
</script>
