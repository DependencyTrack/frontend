<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button
        variant="primary"
        @click="initializeProjectCreateProjectModal"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
        ]"
      >
        <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
      </b-button>
      <b-button
        variant="outline-primary"
        class="ms-2"
        :disabled="selectedProjectUuids.length === 0 || isActiveToggling"
        @click="toggleActiveSelectedProjects"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
        ]"
      >
        {{ $t('message.toggle_active') }}
      </b-button>
      <b-form-checkbox
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showInactiveProjects"
        v-model="showInactiveProjects"
        inline
        switch
        ><span class="text-muted">{{
          $t('message.show_inactive_projects')
        }}</span></b-form-checkbox
      >
      <b-form-checkbox
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showFlatView"
        v-model="showFlatView"
        :disabled="isSearching || hasRouteFilter"
        v-b-tooltip.hover="$t('message.switch_view')"
        inline
        switch
        ><span class="text-muted">{{
          $t('message.show_flat_view')
        }}</span></b-form-checkbox
      >
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="onLoadSuccess"
      @on-post-body="onPostBody"
      @on-check="updateSelectedProjectUuids"
      @on-uncheck="updateSelectedProjectUuids"
      @on-check-all="updateSelectedProjectUuids"
      @on-uncheck-all="updateSelectedProjectUuids"
    >
    </bootstrap-table>
    <project-create-project-modal v-model="showProjectCreateProjectModal" />
  </div>
</template>

<script>
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';
import xssFilters from 'xss-filters';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import permissionsMixin from '../../../mixins/permissionsMixin';
import routerMixin from '../../../mixins/routerMixin';
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import PolicyViolationProgressBar from '../../components/PolicyViolationProgressBar.vue';
import SeverityProgressBar from '../../components/SeverityProgressBar.vue';
import ProjectCreateProjectModal from './ProjectCreateProjectModal.vue';

// Filtered results are mostly child projects, which the tree view (onlyRoot=true) hides.
const hasRouteFilter = ({ tag, team, classifier }) =>
  !!(tag || team || classifier);
const storedFlatView = () =>
  !!localStorage && localStorage.getItem('ProjectListShowFlatView') === 'true';

export default {
  mixins: [bootstrapTableMixin, permissionsMixin, routerMixin],
  components: {
    ProjectCreateProjectModal,
  },
  props: {
    // If only children from a specific project shall be shown,
    // this must be set to the corresponding project.
    uuid: String,
  },
  created() {
    this.options.url = this.apiUrl();
  },
  computed: {
    hasRouteFilter() {
      return hasRouteFilter(this.$route.query);
    },
  },
  methods: {
    initializeProjectCreateProjectModal: function () {
      EventBus.emit('initializeProjectCreateProjectModal');
    },
    apiUrl: function (parentUuid) {
      if (this.uuid && !parentUuid) {
        parentUuid = this.uuid;
      }

      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/concise`;
      if (parentUuid) {
        url += `/${parentUuid}/children`;
      }
      let queryParams = {
        includeMetrics: true,
      };
      if (this.showInactiveProjects === false) {
        queryParams['active'] = true;
      }
      let tag = this.$route.query.tag;
      if (tag) {
        queryParams['tag'] = tag;
      }
      let team = this.$route.query.team;
      if (team) {
        queryParams['team'] = team;
      }
      let classifier = this.$route.query.classifier;
      if (classifier) {
        queryParams['classifier'] = classifier;
      }
      if (this.isSearching || parentUuid) {
        queryParams['onlyRoot'] = false;
      } else {
        if (this.showFlatView === undefined) {
          queryParams['onlyRoot'] = true;
        } else {
          queryParams['onlyRoot'] = !this.showFlatView;
        }
      }
      let queryString = Object.keys(queryParams)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
        )
        .join('&');
      return `${url}?${queryString}`;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true,
        pageNumber: 1,
      });
    },
    onLoadSuccess: function () {
      this.updateSelectedProjectUuids();
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectList',
        this.$refs.table.columns,
      );
    },
    onPostBody: function () {
      this.mountCells();
      this.updateSelectedProjectUuids();
      const table = this.$refs.table;
      const projects = table.getData();
      table.$table.find('input[name="btSelectItem"]').each((_index, input) => {
        const project = projects[Number(input.dataset.index)];
        input.setAttribute(
          'aria-label',
          `${this.$t('message.select_project')}: ${project.name}`,
        );
      });
      table.$table
        .closest('.bootstrap-table')
        .find('input[name="btSelectAll"]')
        .attr('aria-label', this.$t('message.select_all'));
      if (!this.showFlatView && !this.isSearching) {
        let columns = this.$refs.table.getOptions().columns;

        if (columns && columns[0][1].visible) {
          this.$refs.table.$table.treegrid({
            treeColumn: 1,
            initialState: 'collapsed',
          });
        }
        this.$refs.table.getData().forEach((project) => {
          // Expander is rendered natively by treegrid when children are
          // already loaded. No extra logic needed.
          if (project.fetchedChildren) {
            return;
          }

          const renderExpander = () => {
            this.$refs.table.$table
              .find('tbody')
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
        this.$refs.table.getData().forEach((row) => {
          if (row.expanded) {
            this.$refs.table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.uuid)
              .treegrid('expand');
          } else if (row.expanded === false) {
            this.$refs.table.$table
              .find('tbody')
              .find('tr.treegrid-' + row.uuid)
              .treegrid('collapse');
          }
        });
      }
      this.$refs.table.hideLoading();
    },
    toggleActiveSelectedProjects: async function () {
      this.isActiveToggling = true;
      const table = this.$refs.table;
      const projects = table.getData();

      // Create map of project UUIDs to project objects active attribute value for toggling
      const projectActiveMap = {};

      for (let project of projects) {
        projectActiveMap[project.uuid] = project.active;
      }

      try {
        await Promise.all(
          this.selectedProjectUuids.map((uuid) =>
            this.axios.patch(
              `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${uuid}`,
              { active: !projectActiveMap[uuid] },
            ),
          ),
        );
        this.$toastr.s(this.$t('message.project_updated'));
      } finally {
        this.isActiveToggling = false;
        this.refreshTable();
      }
    },
    updateSelectedProjectUuids: function () {
      this.selectedProjectUuids = this.$refs.table
        .getSelections()
        .map((project) => project.uuid);
    },
    getChildren: async function (parentProject) {
      let url = this.apiUrl(parentProject.uuid);
      await this.axios.get(url).then((response) => {
        for (let project of response.data) {
          project.pid = parentProject.uuid;
        }
        this.$refs.table.append(response.data);
      });
    },
    hasMatchingChildren: function (project) {
      if (!project.hasChildren) {
        return Promise.resolve(false);
      }

      // Perform a pre-flight search if there is at least one
      // child project that matches the current search criteria,
      // and is accessible to the user.
      //
      // While this *does* result in an additional request per project
      // with hasChildren=true, it's still better than returning child
      // data in the project list response.
      let url = this.apiUrl(project.uuid);
      return this.axios
        .get(`${url}&pageNumber=1&pageSize=1`)
        .then((response) => Number(response.headers['x-total-count']) > 0);
    },
  },
  watch: {
    $route() {
      this.refreshTable();
    },
    hasRouteFilter(filtered) {
      // Leaving a filter restores the stored preference.
      this.showFlatView = filtered || this.isSearching || storedFlatView();
    },
    showInactiveProjects() {
      if (localStorage) {
        localStorage.setItem(
          'ProjectListShowInactiveProjects',
          this.showInactiveProjects.toString(),
        );
      }
      this.$refs.table.showLoading();
      this.currentPage = 1;
      this.refreshTable();
    },
    showFlatView() {
      // A forced flat view is not the user's preference.
      if (localStorage && !this.hasRouteFilter && !this.isSearching) {
        localStorage.setItem(
          'ProjectListShowFlatView',
          this.showFlatView.toString(),
        );
      }
      this.$refs.table.showLoading();
      this.refreshTable();
    },
    isSearching() {
      this.refreshTable();
    },
  },
  data() {
    return {
      showProjectCreateProjectModal: false,
      showInactiveProjects:
        localStorage &&
        localStorage.getItem('ProjectListShowInactiveProjects') !== null
          ? localStorage.getItem('ProjectListShowInactiveProjects') === 'true'
          : false,
      // Like searching, a filter forces the flat view.
      showFlatView: hasRouteFilter(this.$route.query) || storedFlatView(),
      isSearching: false,
      selectedProjectUuids: [],
      isActiveToggling: false,
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
          switchable: false,
        },
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
              }).fullPath,
            );
            let collectionIcon = '';
            if (row.collectionLogic) {
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
          routerFunc: () => this.$router, // Injecting $router directly causes recursion errors in Vue...
          formatter(_value, row) {
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
          field: 'isLatest',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
          align: 'center',
          sortable: true,
          visible: false,
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
          field: 'lastBomImport',
          sortable: true,
          formatter(timestamp) {
            return typeof timestamp === 'number'
              ? common.formatTimestamp(timestamp, true)
              : '-';
          },
        },
        {
          title: this.$t('message.bom_format'),
          field: 'lastBomImportFormat',
          sortable: true,
          visible: false,
        },
        {
          title: this.$t('message.risk_score'),
          field: 'lastRiskScore',
          sortable: true,
        },
        {
          title: this.$t('message.active'),
          field: 'active',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
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
          field: 'metrics.policyViolationsTotal', // this column uses other fields, but the field id must be unique
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
      data: [],
      options: {
        idField: 'uuid',
        parentIdField: 'pid',
        treeShowField: 'name',
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        currentPage: 1,
        pageSize:
          localStorage && localStorage.getItem('ProjectListPageSize') !== null
            ? Number(localStorage.getItem('ProjectListPageSize'))
            : 10,
        sortName:
          localStorage && localStorage.getItem('ProjectListSortName') !== null
            ? localStorage.getItem('ProjectListSortName')
            : undefined,
        sortOrder:
          localStorage && localStorage.getItem('ProjectListSortOrder') !== null
            ? localStorage.getItem('ProjectListSortOrder')
            : undefined,
        searchText: this.$route.query.searchText
          ? this.$route.query.searchText
          : '',
        icons: {
          refresh: 'fa-refresh',
        },
        toolbar: '#projectsToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        // onClickRow is used instead of a tree node's onExpand event, because onExpand does not pass any arguments and therefore makes it complicated to retrieve a row's data which is needed for fetching its children and appending the data
        onClickRow: (row, $element, field) => {
          if (field !== 'state' && !this.showFlatView && !this.isSearching) {
            if (
              event.target.tagName.toLowerCase() !== 'a' &&
              $element.treegrid('isLeaf') &&
              row.hasChildren &&
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
          }
        },
        onSearch: (text) => {
          this.isSearching = text.length !== 0;
          this.showFlatView =
            this.isSearching || this.hasRouteFilter || storedFlatView();
          this.setSearchTextQuery(text);
        },
        onPageChange: (number, size) => {
          this.updateSelectedProjectUuids();
          if (localStorage) {
            localStorage.setItem('ProjectListPageSize', size.toString());
          }
          this.currentPage = number;
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
