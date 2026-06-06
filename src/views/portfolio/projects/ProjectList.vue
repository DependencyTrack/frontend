<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button
        size="md"
        variant="outline-primary"
        @click="initializeProjectCreateProjectModal"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
        ]"
      >
        <span class="fa fa-plus"></span> {{ $t('message.create_project') }}
      </b-button>
      <c-switch
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showInactiveProjects"
        color="primary"
        v-model="showInactiveProjects"
        label
        v-bind="labelIcon"
      /><span class="text-muted">{{
        $t('message.show_inactive_projects')
      }}</span>
      <c-switch
        @click.native="saveViewState"
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showFlatView"
        color="primary"
        v-model="showFlatView"
        label
        v-bind="labelIcon"
        :disabled="isSearching"
        v-b-tooltip.hover
        :title="$t('message.switch_view')"
      /><span class="text-muted">{{ $t('message.show_flat_view') }}</span>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="onLoadSuccess"
      @on-pre-body="onPreBody"
      @on-post-body="onPostBody"
    >
    </bootstrap-table>
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
import routerMixin from '../../../mixins/routerMixin';
import common from '../../../shared/common';
import PolicyViolationProgressBar from '../../components/PolicyViolationProgressBar';
import SeverityProgressBar from '../../components/SeverityProgressBar';
import ProjectCreateProjectModal from './ProjectCreateProjectModal';

export default {
  mixins: [permissionsMixin, routerMixin],
  components: {
    cSwitch,
    ProjectCreateProjectModal,
  },
  props: {
    // If only children from a specific project shall be shown,
    // this must be set to the corresponding project.
    uuid: String,
  },
  beforeCreate() {
    this.showInactiveProjects =
      localStorage &&
      localStorage.getItem('ProjectListShowInactiveProjects') !== null
        ? localStorage.getItem('ProjectListShowInactiveProjects') === 'true'
        : false;
    this.showFlatView =
      localStorage && localStorage.getItem('ProjectListShowFlatView') !== null
        ? localStorage.getItem('ProjectListShowFlatView') === 'true'
        : false;
  },
  methods: {
    initializeProjectCreateProjectModal: function () {
      this.$root.$emit('initializeProjectCreateProjectModal');
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
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectList',
        this.$refs.table.columns,
      );
    },
    onPreBody: function () {
      this.$refs.table.getData().forEach((project) => {
        project.id = MurmurHash2(project.uuid).result();
      });
    },
    onPostBody: function () {
      if (!this.showFlatView && !this.isSearching) {
        let columns = this.$refs.table.getOptions().columns;

        if (columns && columns[0][0].visible) {
          this.$refs.table.$table.treegrid({
            treeColumn: 0,
            initialState: 'collapsed',
          });
        }
        this.$refs.table.getData().forEach((project) => {
          if (project.fetchedChildren || project.checkedHasChildren) {
            return;
          }
          project.checkedHasChildren = true;

          this.hasMatchingChildren(project).then((doesHaveMatchingChildren) => {
            if (doesHaveMatchingChildren) {
              this.$refs.table.$table
                .find('tbody')
                .find('tr.treegrid-' + project.id.toString())
                .addClass('treegrid-collapsed');
              this.$refs.table.$table
                .find('tbody')
                .find('tr.treegrid-' + project.id.toString())
                .treegrid('renderExpander');
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
    getChildren: async function (parentProject) {
      let url = this.apiUrl(parentProject.uuid);
      await this.axios.get(url).then((response) => {
        for (let project of response.data) {
          project.pid = MurmurHash2(parentProject.uuid).result();
        }
        this.$refs.table.append(response.data);
      });
    },
    hasMatchingChildren: function (project) {
      if (!project.hasChildren) {
        return new Promise(() => false);
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
    saveViewState: function () {
      this.savedViewState = this.showFlatView;
    },
  },
  watch: {
    $route(to, from) {
      this.refreshTable();
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
      if (localStorage) {
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
      showInactiveProjects: this.showInactiveProjects,
      showFlatView: this.showFlatView,
      isSearching: false,
      savedViewState: null,
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
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              this.routerFunc().resolve({
                name: 'Project',
                params: { uuid: row.uuid },
              }).route.fullPath,
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
          formatter(value, row, index) {
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
          visible: false,
          routerFunc: () => this.$router, // Injecting $router directly causes recursion errors in Vue...
          formatter(value, row, index) {
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
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.latest'),
          field: 'isLatest',
          formatter(value, row, index) {
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
          field: 'lastBomImport',
          sortable: true,
          formatter(timestamp, row, index) {
            return typeof timestamp === 'number'
              ? common.formatTimestamp(timestamp, true)
              : '-';
          },
        },
        {
          title: this.$t('message.bom_format'),
          field: 'lastBomImportFormat',
          sortable: true,
        },
        {
          title: this.$t('message.risk_score'),
          field: 'lastRiskScore',
          sortable: true,
        },
        {
          title: this.$t('message.active'),
          field: 'active',
          formatter(value, row, index) {
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
          field: 'metrics.vulnerabilities', // this column uses other fields, but the field id must be unique
          sortable: false,
          formatter: function (_, row) {
            let metrics = row.metrics;
            if (typeof metrics === 'undefined') {
              return '-'; // No vulnerability info available
            }

            // Programmatically instantiate SeverityProgressBar Vue component
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
      data: [],
      options: {
        idField: 'id',
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
        url: this.apiUrl(),
        // onClickRow is used instead of a tree node's onExpand event, because onExpand does not pass any arguments and therefore makes it complicated to retrieve a row's data which is needed for fetching its children and appending the data
        onClickRow: (row, $element) => {
          if (!this.showFlatView && !this.isSearching) {
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
          if (this.isSearching) {
            this.showFlatView = true;
          } else {
            if (this.savedViewState !== null) {
              this.showFlatView = !this.savedViewState;
            } else {
              this.showFlatView = false;
            }
          }
          this.setSearchTextQuery(text);
        },
        onPageChange: (number, size) => {
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
