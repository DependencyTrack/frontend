<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button
        size="md"
        variant="outline-primary"
        @click="initializeProjectCreateProjectModal"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
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
      @on-pre-body="onPreBody"
      @on-post-body="onPostBody"
      @on-load-success="onLoadSuccess"
    >
    </bootstrap-table>
    <project-create-project-modal v-on:refreshTable="refreshTable" />
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
import PortfolioWidgetRow from '../../dashboard/PortfolioWidgetRow';
import ProjectCreateProjectModal from './ProjectCreateProjectModal';

export default {
  mixins: [permissionsMixin, routerMixin],
  components: {
    cSwitch,
    ProjectCreateProjectModal,
    PortfolioWidgetRow,
  },
  props: {
    /**
     * If only children from a specific project shall be shown this must be set to the corresponding project
     */
    parentProject: Object,
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
    apiUrl: function (uuid) {
      // if we only want to show children of a specific parent we force the base call to fetch its children
      if (this.uuid && !uuid) {
        uuid = this.uuid;
      }

      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      if (uuid) {
        url += `/${uuid}/children`;
      }
      let tag = this.$route.query.tag;
      if (tag) {
        url += '/tag/' + encodeURIComponent(tag);
      }
      let classifier = this.$route.query.classifier;
      if (classifier) {
        url += '/classifier/' + encodeURIComponent(classifier);
      }
      if (this.showInactiveProjects === undefined) {
        url += '?excludeInactive=true';
      } else {
        url += '?excludeInactive=' + !this.showInactiveProjects;
      }
      if (this.isSearching) {
        url += '&onlyRoot=false';
      } else {
        if (this.showFlatView === undefined) {
          url += '&onlyRoot=true';
        } else {
          url += '&onlyRoot=' + !this.showFlatView;
        }
      }
      return url;
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
          if (
            project.children &&
            !project.fetchedChildren &&
            (this.showInactiveProjects ||
              project.children.some((child) => child.active)) &&
            (!this.$route.query.classifier ||
              project.children.some(
                (child) => child.classifier === this.$route.query.classifier,
              )) &&
            (!this.$route.query.tag ||
              project.children.some(
                (child) => child.tag === this.$route.query.tag,
              ))
          ) {
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
    getChildren: async function (project) {
      let url = this.apiUrl(project.uuid);
      await this.axios.get(url).then((response) => {
        for (let project of response.data) {
          if (project.parent) {
            project.pid = MurmurHash2(project.parent.uuid).result();
          }
        }
        this.$refs.table.append(response.data);
      });
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
              }).href,
            );
            let collectionIcon = '';
            if (row.collectionLogic !== 'NONE') {
              let title = '';
              switch (row.collectionLogic) {
                case 'AGGREGATE_DIRECT_CHILDREN':
                  title = this.$t(
                    'message.collection_logic_metrics_by_aggregate_direct_children',
                  );
                  break;
                case 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG':
                  const tag = !row.collectionTag
                    ? ''
                    : xssFilters.inDoubleQuotedAttr(row.collectionTag.name);
                  title = this.$t(
                    'message.collection_logic_metrics_by_aggregate_direct_children_with_tags',
                    { tag: tag },
                  );
                  break;
                case 'AGGREGATE_LATEST_VERSION_CHILDREN':
                  title = this.$t(
                    'message.collection_logic_metrics_by_aggregate_latest_version',
                  );
                  break;
              }
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
          routerFunc: () => this.$router, // needed by formatter
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
          field: 'lastInheritedRiskScore',
          sortable: true,
        },
        {
          title: this.$t('message.active'),
          field: 'active',
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
          align: 'center',
          sortable: true,
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
              row.children &&
              !row.fetchedChildren &&
              (this.showInactiveProjects ||
                row.children.some((child) => child.active)) &&
              (!this.$route.query.classifier ||
                row.children.some(
                  (child) => child.classifier === this.$route.query.classifier,
                )) &&
              (!this.$route.query.tag ||
                row.children.some(
                  (child) => child.tag === this.$route.query.tag,
                ))
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
