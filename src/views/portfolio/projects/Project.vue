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
                    v-if="project.uuid"
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
                        v-b-tooltip.hover
                        :title="$t('message.switch_version')"
                        class="version-dropdown-toggle badge badge-pill border"
                        ><i class="fa fa-caret-down" aria-hidden="true"></i
                        ><span
                          class="ml-1"
                          :class="{
                            'text-muted font-italic': !project.version,
                          }"
                          >{{
                            project.version || $t('message.no_version')
                          }}</span
                        ><i
                          v-if="project.isLatest"
                          class="fa fa-star text-warning ml-1"
                          aria-hidden="true"
                        ></i
                        ><span
                          v-if="versionCount > 1"
                          class="version-count border-left"
                          >{{ versionCount }}</span
                        ></a
                      >
                      <ul class="dropdown-menu">
                        <b-dropdown-item
                          href="#"
                          v-permission:or="[
                            PERMISSIONS.PORTFOLIO_MANAGEMENT,
                            PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
                          ]"
                          @click.prevent="
                            $root.$emit(
                              'bv::show::modal',
                              'projectAddVersionModal',
                            )
                          "
                        >
                          <i
                            class="fa fa-plus mr-1 add-version-icon"
                            aria-hidden="true"
                          ></i
                          >{{ $t('message.add_version') }}
                        </b-dropdown-item>
                        <b-dropdown-divider
                          v-permission:or="[
                            PERMISSIONS.PORTFOLIO_MANAGEMENT,
                            PERMISSIONS.PORTFOLIO_MANAGEMENT_CREATE,
                          ]"
                        />
                        <span
                          v-for="projectVersion in activeProjectVersions"
                          :key="projectVersion.uuid"
                        >
                          <b-dropdown-item
                            :to="{
                              name: 'Project',
                              params: { uuid: projectVersion.uuid },
                            }"
                          >
                            <span v-if="projectVersion.version">{{
                              projectVersion.version
                            }}</span>
                            <span v-else class="text-muted font-italic">{{
                              $t('message.no_version')
                            }}</span>
                            <i
                              v-if="projectVersion.isLatest"
                              class="fa fa-star text-warning ml-1"
                              aria-hidden="true"
                              v-b-tooltip.hover
                              :title="$t('message.latest_version')"
                            ></i>
                          </b-dropdown-item>
                        </span>
                        <b-dropdown-group
                          v-if="inactiveProjectVersions.length > 0"
                          :header="$t('message.inactive_versions')"
                        >
                          <span
                            v-for="projectVersion in inactiveProjectVersions"
                            :key="projectVersion.uuid"
                          >
                            <b-dropdown-item
                              :to="{
                                name: 'Project',
                                params: { uuid: projectVersion.uuid },
                              }"
                            >
                              <span v-if="projectVersion.version">{{
                                projectVersion.version
                              }}</span>
                              <span v-else class="text-muted font-italic">{{
                                $t('message.no_version')
                              }}</span>
                              <i
                                v-if="projectVersion.isLatest"
                                class="fa fa-star text-warning ml-1"
                                aria-hidden="true"
                                v-b-tooltip.hover
                                :title="$t('message.latest_version')"
                              ></i>
                            </b-dropdown-item>
                          </span>
                        </b-dropdown-group>
                      </ul>
                    </li>
                  </ol>
                  <i
                    v-if="isCollectionProject"
                    class="fa fa-calculator fa-fw collectionlogic-icon"
                    v-b-tooltip.hover="{
                      title: getCollectionLogicText(project),
                    }"
                  ></i>
                </b-col>
                <b-badge v-if="!this.project.active" :variant="'tab-warn'">
                  {{ $t('message.inactive').toUpperCase() }}
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
        v-if="isShowComponents"
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
        v-if="isShowCollectionProjects"
        lazy
      >
        <template v-slot:title
          ><i class="fa fa-sitemap"></i>
          {{ $t('message.collection_projects') }}</template
        >
        <project-list :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
      <b-tab ref="services" @click="routeTo('services')" v-if="isShowServices">
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
        v-if="isShowDependencyGraph"
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
      <b-tab ref="findings" v-if="isShowFindings" @click="routeTo('findings')">
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
      <b-tab ref="epss" v-if="isShowFindings" @click="routeTo('epss')">
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
        v-if="isShowPolicyViolations"
        @click="routeTo('policyViolations')"
      >
        <template v-slot:title
          ><i class="fa fa-fire"></i> {{ $t('message.policy_violations') }}
          <b-badge
            variant="tab-total"
            v-b-tooltip.hover
            :title="$t('policy_violation.total')"
            >{{ totalViolations }}</b-badge
          >
          <b-badge
            variant="tab-info"
            v-b-tooltip.hover
            :title="$t('policy_violation.infos')"
            >{{ infoViolations }}</b-badge
          >
          <b-badge
            variant="tab-warn"
            v-b-tooltip.hover
            :title="$t('policy_violation.warns')"
            >{{ warnViolations }}</b-badge
          >
          <b-badge
            variant="tab-fail"
            v-b-tooltip.hover
            :title="$t('policy_violation.fails')"
            >{{ failViolations }}</b-badge
          >
        </template>
        <project-policy-violations
          :key="this.uuid"
          :uuid="this.uuid"
          v-on:total="totalViolations = $event"
        />
      </b-tab>
    </b-tabs>
    <project-details-modal
      :project-input="project"
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
import ProjectList from './ProjectList';
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
    ProjectList,
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
      return (this.project.versions || []).filter((version) => version.active);
    },
    inactiveProjectVersions() {
      return (this.project.versions || []).filter((version) => !version.active);
    },
    versionCount() {
      return this.project.versions && this.project.versions.length > 0
        ? this.project.versions.length
        : 1;
    },
    isCollectionProject: function () {
      return !!this.project.collectionLogic;
    },
    isShowComponents: function () {
      return !this.isCollectionProject;
    },
    isShowCollectionProjects: function () {
      return this.isCollectionProject;
    },
    isShowServices: function () {
      return !this.isCollectionProject;
    },
    isShowDependencyGraph: function () {
      return !this.isCollectionProject;
    },
    isShowFindings: function () {
      return (
        !this.isCollectionProject &&
        this.isPermitted(this.PERMISSIONS.VIEW_VULNERABILITY)
      );
    },
    isShowPolicyViolations: function () {
      return (
        !this.isCollectionProject &&
        this.isPermitted(this.PERMISSIONS.VIEW_POLICY_VIOLATION)
      );
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
      totalViolations: 0,
      infoViolations: 0,
      warnViolations: 0,
      failViolations: 0,
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
      return this.axios
        .get(projectUrl)
        .catch((error) => {
          if (error.response.status === 403) {
            this.$router.replace({ name: 'Projects' });
          }
        })
        .then((response) => {
          this.project = response.data;
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
          this.infoViolations = common.valueWithDefault(
            this.project.metrics.policyViolationsInfo,
            0,
          );
          this.warnViolations = common.valueWithDefault(
            this.project.metrics.policyViolationsWarn,
            0,
          );
          this.failViolations = common.valueWithDefault(
            this.project.metrics.policyViolationsFail,
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
        '/projects\\/' + this.uuid + '\\/([^\\/?#]*)',
        'gi',
      );
      let tab = pattern.exec(this.$route.fullPath.toLowerCase());
      let refName = tab && tab[1] ? tab[1].toLowerCase() : 'overview';
      return this.$refs[refName] || this.$refs['overview'];
    },
    getCollectionLogicText: function (project) {
      return common.getCollectionLogicText(this, project);
    },
  },
  beforeMount() {
    this.uuid = this.$route.params.uuid;
    this.initialize()
      .then(() => {
        this.$nextTick(() => {
          if (this.$route.params.componentUuids) {
            this.$refs.dependencygraph.active = true;
          } else {
            this.getTabFromRoute().active = true;
          }
        });
      })
      .catch((e) => {
        console.error(e);
        this.$toastr.e(this.$t('condition.forbidden'));
        this.$router.replace({ path: '/projects/' + this.uuid });
        this.$refs.overview.active = true;
      });
  },
  watch: {
    $route(to, from) {
      this.uuid = this.$route.params.uuid;
      if (to.params.uuid !== from.params.uuid) {
        this.initialize();
      } else if (
        this.$route.params.componentUuids &&
        this.$refs.dependencygraph
      ) {
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
.add-version-icon {
  color: inherit !important;
}
.version-dropdown-toggle.badge {
  padding: 0.3em 0.6em;
  margin-left: 0.5rem;
  vertical-align: middle;
  color: inherit;
  background-color: transparent;
}
.version-dropdown-toggle.badge:hover {
  color: inherit;
}
.version-dropdown-toggle .fa-caret-down {
  transition: transform 0.15s ease-in-out;
}
.version-dropdown-toggle[aria-expanded='true'] .fa-caret-down {
  transform: rotate(180deg);
}
.version-count {
  margin-left: 0.5rem;
  padding-left: 0.5rem;
}
</style>
