<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i
              class="fa fa-sitemap bg-primary p-3 font-2xl mr-3 float-left"
            ></i>
            <div class="h5 mb-0 mt-2">
              <b-row>
                <b-col class="text-nowrap" md="auto">
                  {{ project.name }}
                  <ol
                    v-if="project.version"
                    style="
                      display: inline-block;
                      margin: 0;
                      list-style-type: none;
                      padding-inline-start: 0;
                    "
                  >
                    <li class="dropdown">
                      <a
                        href="#"
                        data-toggle="dropdown"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                        ><i
                          class="fa fa-caret-down"
                          aria-hidden="true"
                          style="
                            padding-left: 10px;
                            padding-right: 10px;
                            padding-top: 3px;
                            padding-bottom: 3px;
                          "
                        ></i
                      ></a>
                      <ul class="dropdown-menu">
                        <span v-for="projectVersion in activeProjectVersions">
                          <b-dropdown-item
                            :to="{
                              name: 'Project',
                              params: { uuid: projectVersion.uuid },
                            }"
                          >
                            {{ projectVersion.version }}
                          </b-dropdown-item>
                        </span>

                        <b-dropdown-group
                          v-if="inactiveProjectVersions.length > 0"
                          :header="$t('message.inactive_versions')"
                        >
                          <span
                            v-for="projectVersion in inactiveProjectVersions"
                          >
                            <b-dropdown-item
                              :to="{
                                name: 'Project',
                                params: { uuid: projectVersion.uuid },
                              }"
                            >
                              {{ projectVersion.version }}
                            </b-dropdown-item>
                          </span>
                        </b-dropdown-group>
                      </ul>
                    </li>
                  </ol>
                  {{ project.version }}
                  <i
                    v-if="isCollectionProject()"
                    class="fa fa-calculator fa-fw collectionlogic-icon"
                    v-b-tooltip.hover="{
                      title: getCollectionLogicText(project),
                    }"
                  ></i>
                </b-col>
                <b-badge v-if="!this.project.active" :variant="'tab-warn'">
                  {{ $t('message.inactive').toUpperCase() }}
                </b-badge>
                <b-badge v-if="this.project.isLatest" :variant="'tab-info'">
                  {{ $t('message.latest_version').toUpperCase() }}
                </b-badge>
                <b-col class="d-none d-md-flex">
                  <span
                    class="text-muted font-xs font-italic align-text-top text-truncate"
                    style="max-width: 100ch"
                    v-b-tooltip.hover="{ title: project.description }"
                    >{{ project.description }}</span
                  >
                </b-col>
              </b-row>
            </div>
            <div class="text-muted font-xs">
              <span class="text-lowercase font-weight-bold">
                <span v-for="tag in project.tags">
                  <b-badge
                    :to="{ name: 'Projects', query: { tag: tag.name } }"
                    variant="tag"
                    >{{ tag.name }}</b-badge
                  >
                </span>
              </span>
            </div>
          </b-col>
          <b-col md="auto">
            <b-row class="d-none d-md-flex float-right">
              <vue-easy-pie-chart
                style="margin-right: 1rem"
                :bar-color="severityCritical"
                font-size="14px"
                :track-color="trackColor"
                scale-color=""
                line-cap="round"
                :line-width="3"
                :percent="100"
                :size="50"
                :animate="true"
                v-b-tooltip.hover
                :title="$t('vulnerability.critical')"
                >{{ currentCritical }}</vue-easy-pie-chart
              >
              <vue-easy-pie-chart
                style="margin-right: 1rem"
                :bar-color="severityHigh"
                font-size="14px"
                :track-color="trackColor"
                scale-color=""
                line-cap="round"
                :line-width="3"
                :percent="100"
                :size="50"
                :animate="true"
                v-b-tooltip.hover
                :title="$t('vulnerability.high')"
                >{{ currentHigh }}</vue-easy-pie-chart
              >
              <vue-easy-pie-chart
                style="margin-right: 1rem"
                :bar-color="severityMedium"
                font-size="14px"
                :track-color="trackColor"
                scale-color=""
                line-cap="round"
                :line-width="3"
                :percent="100"
                :size="50"
                :animate="true"
                v-b-tooltip.hover
                :title="$t('vulnerability.medium')"
                >{{ currentMedium }}</vue-easy-pie-chart
              >
              <vue-easy-pie-chart
                style="margin-right: 1rem"
                :bar-color="severityLow"
                font-size="14px"
                :track-color="trackColor"
                scale-color=""
                line-cap="round"
                :line-width="3"
                :percent="100"
                :size="50"
                :animate="true"
                v-b-tooltip.hover
                :title="$t('vulnerability.low')"
                >{{ currentLow }}</vue-easy-pie-chart
              >
              <vue-easy-pie-chart
                style="margin-right: 1rem"
                :bar-color="severityUnassigned"
                font-size="14px"
                :track-color="trackColor"
                scale-color=""
                line-cap="round"
                :line-width="3"
                :percent="100"
                :size="50"
                :animate="true"
                v-b-tooltip.hover
                :title="$t('vulnerability.unassigned')"
                >{{ currentUnassigned }}</vue-easy-pie-chart
              >
            </b-row>
          </b-col>
        </b-row>
      </b-card-body>
      <div id="project-info-footer" slot="footer">
        <b-row>
          <b-col>
            <b-link
              class="font-weight-bold font-xs btn-block text-muted"
              @click="initializeProjectDetailsModal"
              >{{ $t('message.view_details') }}
              <i class="fa fa-angle-right font-lg"></i
            ></b-link>
          </b-col>
          <b-col v-if="project.externalReferences" md="auto">
            <b-row class="d-none d-md-flex float-right">
              <ExternalReferencesDropdown
                :externalReferences="project.externalReferences"
              />
            </b-row>
          </b-col>
        </b-row>
      </div>
    </b-card>
    <b-tabs
      class="body-bg-color"
      style="border-left: 0; border-right: 0; border-top: 0"
    >
      <b-tab
        ref="overview"
        @click="routeTo()"
        class="body-bg-color overview-chart"
        style="border-left: 0; border-right: 0; border-top: 0"
        active
      >
        <template v-slot:title
          ><i class="fa fa-line-chart"></i>
          {{ $t('message.overview') }}</template
        >
        <project-dashboard
          :key="this.uuid"
          :uuid="this.uuid"
          :project="this.project"
          style="border-left: 0; border-right: 0; border-top: 0"
        />
      </b-tab>
      <b-tab
        ref="components"
        @click="routeTo('components')"
        v-if="isShowComponents()"
      >
        <template v-slot:title
          ><i class="fa fa-cubes"></i> {{ $t('message.components') }}
          <b-badge variant="tab-total">{{ totalComponents }}</b-badge></template
        >
        <project-components
          :key="this.uuid"
          :uuid="this.uuid"
          :project="this.project"
          v-on:total="totalComponents = $event"
        />
      </b-tab>
      <b-tab
        ref="collectionprojects"
        @click="routeTo('collectionprojects')"
        v-if="isShowCollectionProjects()"
        lazy
      >
        <template v-slot:title
          ><i class="fa fa-sitemap"></i>
          {{ $t('message.collection_projects') }}</template
        >
        <project-collection-projects
          :key="this.uuid"
          :uuid="this.uuid"
          :project="this.project"
        />
      </b-tab>
      <b-tab
        ref="services"
        @click="routeTo('services')"
        v-if="isShowServices()"
      >
        <template v-slot:title
          ><i class="fa fa-exchange"></i> {{ $t('message.services') }}
          <b-badge variant="tab-total">{{ totalServices }}</b-badge></template
        >
        <project-services
          :key="this.uuid"
          :uuid="this.uuid"
          v-on:total="totalServices = $event"
        />
      </b-tab>
      <b-tab
        ref="dependencygraph"
        @click="routeTo('dependencyGraph')"
        v-if="isShowDependencyGraph()"
      >
        <template v-slot:title
          ><i class="fa fa-sitemap"></i> {{ $t('message.dependency_graph') }}
          <b-badge variant="tab-total">{{
            totalDependencyGraphs
          }}</b-badge></template
        >
        <project-dependency-graph
          :key="this.uuid"
          :uuid="this.uuid"
          :project="this.project"
          v-on:total="totalDependencyGraphs = $event"
        />
      </b-tab>
      <b-tab
        ref="findings"
        v-if="isShowFindings()"
        @click="routeTo('findings')"
      >
        <template v-slot:title>
          <i class="fa fa-tasks"></i> {{ $t('message.audit_vulnerabilities') }}
          <b-badge
            variant="tab-total"
            v-b-tooltip.hover
            :title="$t('message.total_findings_excluding_aliases')"
            >{{ totalFindings }}</b-badge
          >
          <b-badge
            variant="tab-info"
            v-b-tooltip.hover
            :title="$t('message.total_findings_including_aliases')"
            >{{ totalFindingsIncludingAliases }}</b-badge
          >
        </template>
        <project-findings
          :key="this.uuid"
          :uuid="this.uuid"
          v-on:total="totalFindingsIncludingAliases = $event"
        />
      </b-tab>
      <b-tab ref="epss" v-if="isShowFindings()" @click="routeTo('epss')">
        <template v-slot:title
          ><i class="fa fa-tasks"></i> {{ $t('message.exploit_predictions') }}
          <b-badge variant="tab-total">{{ totalEpss }}</b-badge></template
        >
        <project-epss
          :key="this.uuid"
          :uuid="this.uuid"
          v-on:total="totalEpss = $event"
        />
      </b-tab>
      <b-tab
        ref="policyviolations"
        v-if="isShowPolicyViolations()"
        @click="routeTo('policyViolations')"
      >
        <template v-slot:title
          ><i class="fa fa-fire"></i> {{ $t('message.policy_violations') }}
          <b-badge
            variant="tab-total"
            v-b-tooltip.hover
            :title="$t('policy_violation.total')"
            >{{
              showSuppressedViolations
                ? policyViolationsTotal
                : policyViolationsUnaudited
            }}</b-badge
          >
          <b-badge
            variant="tab-info"
            v-b-tooltip.hover
            :title="$t('policy_violation.infos')"
            >{{
              showSuppressedViolations
                ? policyViolationsInfoTotal
                : policyViolationsInfoUnaudited
            }}</b-badge
          >
          <b-badge
            variant="tab-warn"
            v-b-tooltip.hover
            :title="$t('policy_violation.warns')"
            >{{
              showSuppressedViolations
                ? policyViolationsWarnTotal
                : policyViolationsWarnUnaudited
            }}</b-badge
          >
          <b-badge
            variant="tab-fail"
            v-b-tooltip.hover
            :title="$t('policy_violation.fails')"
            >{{
              showSuppressedViolations
                ? policyViolationsFailTotal
                : policyViolationsFailUnaudited
            }}</b-badge
          >
        </template>
        <project-policy-violations
          :key="this.uuid"
          :uuid="this.uuid"
          v-on:showSuppressedViolations="showSuppressedViolations = $event"
        />
      </b-tab>
    </b-tabs>
    <project-details-modal
      :project="cloneDeep(project)"
      :uuid="this.uuid"
      v-on:projectUpdated="syncProjectFields"
    />
    <project-properties-modal :uuid="this.uuid" />
    <project-create-property-modal :uuid="this.uuid" />
    <project-add-version-modal :uuid="this.uuid" />
  </div>
</template>

<script>
import common from '../../../shared/common';
import { cloneDeep } from 'lodash-es';
import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities';
import VueEasyPieChart from 'vue-easy-pie-chart';
import ProjectComponents from './ProjectComponents';
import ProjectCollectionProjects from './ProjectCollectionProjects';
import ProjectDependencyGraph from './ProjectDependencyGraph';
import ProjectServices from './ProjectServices';
import PortfolioWidgetRow from '../../dashboard/PortfolioWidgetRow';
import ProjectDashboard from './ProjectDashboard';
import SeverityBarChart from '../../dashboard/SeverityBarChart';
import EventBus from '../../../shared/eventbus';
import permissionsMixin from '../../../mixins/permissionsMixin';
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectPropertiesModal from './ProjectPropertiesModal';
import ProjectCreatePropertyModal from './ProjectCreatePropertyModal';
import ProjectAddVersionModal from './ProjectAddVersionModal';
import ProjectFindings from './ProjectFindings';
import ProjectPolicyViolations from './ProjectPolicyViolations';
import ProjectEpss from './ProjectEpss';
import ExternalReferencesDropdown from '../../components/ExternalReferencesDropdown.vue';
import xssFilters from 'xss-filters';

export default {
  mixins: [permissionsMixin],
  components: {
    ProjectPolicyViolations,
    ProjectFindings,
    ProjectAddVersionModal,
    ProjectCreatePropertyModal,
    ProjectPropertiesModal,
    ProjectDetailsModal,
    ProjectComponents,
    ProjectCollectionProjects,
    ProjectDependencyGraph,
    ProjectServices,
    SeverityBarChart,
    ProjectDashboard,
    PortfolioWidgetRow,
    VueEasyPieChart,
    ProjectEpss,
    ExternalReferencesDropdown,
  },
  title: '',
  computed: {
    projectLabel() {
      if (this.project.name && this.project.version) {
        return this.project.name + ' ▸ ' + this.project.version;
      } else {
        return this.project.name;
      }
    },
    activeProjectVersions() {
      return this.project.versions.filter((version) => version.active);
    },
    inactiveProjectVersions() {
      return this.project.versions.filter((version) => !version.active);
    },
  },
  data() {
    return {
      severityCritical: this.getStyle('--severity-critical'),
      severityHigh: this.getStyle('--severity-high'),
      severityMedium: this.getStyle('--severity-medium'),
      severityLow: this.getStyle('--severity-low'),
      severityUnassigned: this.getStyle('--severity-unassigned'),
      severityInfo: this.getStyle('--severity-info'),
      trackColor: this.getStyle('--component-active-color'),
      uuid: null,
      project: {},
      currentCritical: 0,
      currentHigh: 0,
      currentMedium: 0,
      currentLow: 0,
      currentUnassigned: 0,
      currentRiskScore: 0,
      totalComponents: 0,
      totalServices: 0,
      totalDependencyGraphs: 0,
      totalFindings: 0,
      totalFindingsIncludingAliases: 0,
      totalEpss: 0,
      showSuppressedViolations: false,
      policyViolationsTotal: 0,
      policyViolationsUnaudited: 0,
      policyViolationsFailTotal: 0,
      policyViolationsFailUnaudited: 0,
      policyViolationsWarnTotal: 0,
      policyViolationsWarnUnaudited: 0,
      policyViolationsInfoTotal: 0,
      policyViolationsInfoUnaudited: 0,
      tabIndex: 0,
    };
  },
  methods: {
    cloneDeep: function (component) {
      return cloneDeep(component);
    },
    getStyle: function (style) {
      return getStyle(style);
    },
    syncProjectFields: function (project) {
      this.project = project;
      EventBus.$emit('addCrumb', this.projectLabel);
      this.$title = this.projectLabel;
    },
    initialize: function () {
      let projectUrl = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${this.uuid}`;
      this.axios
        .get(projectUrl)
        .catch((error) => {
          if (error.response.status === 403) {
            this.$router.replace({ name: 'Projects' });
          }
        })
        .then((response) => {
          this.project = response.data;
          // metrics are not always returned by API, fix error sometimes raised in following lines
          if (!Object.hasOwn(this.project, 'metrics')) {
            this.project.metrics = {};
          }
          this.currentCritical = common.valueWithDefault(
            this.project.metrics.critical,
            0,
          );
          this.currentHigh = common.valueWithDefault(
            this.project.metrics.high,
            0,
          );
          this.currentMedium = common.valueWithDefault(
            this.project.metrics.medium,
            0,
          );
          this.currentLow = common.valueWithDefault(
            this.project.metrics.low,
            0,
          );
          this.currentUnassigned = common.valueWithDefault(
            this.project.metrics.unassigned,
            0,
          );
          this.currentRiskScore = common.valueWithDefault(
            this.project.metrics.inheritedRiskScore,
            0,
          );
          this.totalFindings = common.valueWithDefault(
            this.project.metrics.findingsTotal,
            0,
          );
          this.policyViolationsTotal = common.valueWithDefault(
            this.project.metrics.policyViolationsTotal,
            0,
          );
          this.policyViolationsUnaudited = common.valueWithDefault(
            this.project.metrics.policyViolationsUnaudited,
            0,
          );
          this.policyViolationsFailTotal = common.valueWithDefault(
            this.project.metrics.policyViolationsFailTotal,
            0,
          );
          this.policyViolationsFailUnaudited = common.valueWithDefault(
            this.project.metrics.policyViolationsFailUnaudited,
            0,
          );
          this.policyViolationsWarnTotal = common.valueWithDefault(
            this.project.metrics.policyViolationsWarnTotal,
            0,
          );
          this.policyViolationsWarnUnaudited = common.valueWithDefault(
            this.project.metrics.policyViolationsWarnUnaudited,
            0,
          );
          this.policyViolationsInfoTotal = common.valueWithDefault(
            this.project.metrics.policyViolationsInfoTotal,
            0,
          );
          this.policyViolationsInfoUnaudited = common.valueWithDefault(
            this.project.metrics.policyViolationsInfoUnaudited,
            0,
          );
          EventBus.$emit('addCrumb', this.projectLabel);
          this.$title = this.projectLabel;
        });
    },
    initializeProjectDetailsModal: function () {
      this.$root.$emit('initializeProjectDetailsModal');
    },
    routeTo(path) {
      if (path) {
        if (
          !this.$route.fullPath.toLowerCase().includes('/' + path.toLowerCase())
        ) {
          this.$router.push({ path: '/projects/' + this.uuid + '/' + path });
        }
      } else if (
        this.$route.fullPath !== '/projects/' + this.uuid &&
        this.$route.fullPath !== '/projects/' + this.uuid + '/'
      ) {
        this.$router.push({ path: '/projects/' + this.uuid });
      }
    },
    getTabFromRoute: function () {
      let pattern = new RegExp(
        '/projects\\/' + this.uuid + '\\/([^\\/]*)',
        'gi',
      );
      let tab = pattern.exec(this.$route.fullPath.toLowerCase());
      return this.$refs[tab && tab[1] ? tab[1].toLowerCase() : 'overview'];
    },
    getCollectionLogicText: function (project) {
      let title =
        'Metrics of collection project are calculated by aggregating numbers of ';
      switch (project.collectionLogic) {
        case 'NONE':
          return '';
        case 'AGGREGATE_DIRECT_CHILDREN':
          title += 'all direct children.';
          break;
        case 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG':
          const tag = !project.collectionTag
            ? ''
            : xssFilters.inDoubleQuotedAttr(project.collectionTag.name);
          title += `direct children with tag '${tag}'.`;
          break;
        case 'LATEST_VERSION_CHILDREN':
          title += 'latest versions of direct children.';
          break;
      }
      return title;
    },
    isCollectionProject: function () {
      return this.project.collectionLogic !== 'NONE';
    },
    isShowComponents: function () {
      return !this.isCollectionProject();
    },
    isShowCollectionProjects: function () {
      return this.isCollectionProject();
    },
    isShowServices: function () {
      return !this.isCollectionProject();
    },
    isShowDependencyGraph: function () {
      return !this.isCollectionProject();
    },
    isShowFindings: function () {
      return (
        !this.isCollectionProject() &&
        this.isPermitted(this.PERMISSIONS.VIEW_VULNERABILITY)
      );
    },
    isShowPolicyViolations: function () {
      return (
        !this.isCollectionProject() &&
        this.isPermitted(this.PERMISSIONS.VIEW_POLICY_VIOLATION)
      );
    },
  },
  beforeMount() {
    this.uuid = this.$route.params.uuid;
    this.initialize();
  },
  mounted() {
    try {
      if (this.$route.params.componentUuids) {
        this.$refs.dependencygraph.active = true;
      } else {
        this.getTabFromRoute().active = true;
      }
    } catch (e) {
      this.$toastr.e(this.$t('condition.forbidden'));
      this.$router.replace({ path: '/projects/' + this.uuid });
      this.$refs.overview.active = true;
    }
  },
  watch: {
    $route(to, from) {
      this.uuid = this.$route.params.uuid;
      if (to.params.uuid !== from.params.uuid) {
        this.initialize();
      } else if (this.$route.params.componentUuids) {
        this.initialize();
        this.$refs.dependencygraph.activate();
      }
      this.getTabFromRoute().activate();
    },
  },
  destroyed() {
    EventBus.$emit('crumble');
  },
};
</script>

<style scoped>
.overview-chart {
  padding: 0;
}
.badge {
  margin-right: 0.4rem;
}
.dropdown-menu {
  max-height: 30rem;
  overflow-y: auto;
}
</style>
