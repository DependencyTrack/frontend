<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-card :no-body="true" footer-class="px-3 py-2">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i
              class="fa fa-sitemap page-header-icon p-3 font-2xl me-3 float-start"
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
                    <li
                      class="dropdown"
                      v-on="{ 'shown.bs.dropdown': focusVersionFilter }"
                    >
                      <a
                        href="#"
                        data-bs-toggle="dropdown"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                        v-b-tooltip.hover="$t('message.switch_version')"
                        class="version-dropdown-toggle badge rounded-pill border"
                        ><i class="fa fa-caret-down" aria-hidden="true"></i
                        ><span
                          class="ms-1"
                          :class="{
                            'text-muted fst-italic': !project.version,
                          }"
                          >{{
                            project.version || $t('message.no_version')
                          }}</span
                        ><i
                          v-if="project.isLatest"
                          class="fa fa-star text-warning ms-1"
                          aria-hidden="true"
                        ></i
                        ><span
                          v-if="versionCount > 1"
                          class="version-count border-start"
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
                          @click.prevent="showProjectAddVersionModal = true"
                        >
                          <i
                            class="fa fa-plus me-1 add-version-icon"
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
                        <li class="px-2 pb-2">
                          <b-form-input
                            ref="versionFilter"
                            v-model="versionQuery"
                            type="search"
                            size="sm"
                            :placeholder="$t('message.filter_versions')"
                            :aria-label="$t('message.filter_versions')"
                          />
                        </li>
                        <span
                          v-for="projectVersion in activeProjectVersions"
                          :key="projectVersion.uuid"
                        >
                          <b-dropdown-item
                            :to="{
                              name: 'Project',
                              params: {
                                uuid: projectVersion.uuid,
                                tab: $route.params.tab,
                              },
                            }"
                          >
                            <span v-if="projectVersion.version">{{
                              projectVersion.version
                            }}</span>
                            <span v-else class="text-muted fst-italic">{{
                              $t('message.no_version')
                            }}</span>
                            <i
                              v-if="projectVersion.isLatest"
                              class="fa fa-star text-warning ms-1"
                              aria-hidden="true"
                              v-b-tooltip.hover="$t('message.latest_version')"
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
                                params: {
                                  uuid: projectVersion.uuid,
                                  tab: $route.params.tab,
                                },
                              }"
                            >
                              <span v-if="projectVersion.version">{{
                                projectVersion.version
                              }}</span>
                              <span v-else class="text-muted fst-italic">{{
                                $t('message.no_version')
                              }}</span>
                              <i
                                v-if="projectVersion.isLatest"
                                class="fa fa-star text-warning ms-1"
                                aria-hidden="true"
                                v-b-tooltip.hover="$t('message.latest_version')"
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
                <b-badge
                  v-if="!this.project.active"
                  :variant="'tab-warn'"
                  class="w-auto"
                >
                  {{ $t('message.inactive').toUpperCase() }}
                </b-badge>
                <b-col class="d-none d-md-flex">
                  <span
                    class="text-muted font-xs fst-italic align-text-top text-truncate"
                    style="max-width: 100ch"
                    v-b-tooltip.hover="{ title: project.description }"
                    >{{ project.description }}</span
                  >
                </b-col>
              </b-row>
            </div>
            <!--
            These repeat the title's b-row/b-col nesting so all three lines
            share a left edge. A bare block starts 15px further left, because
            it wraps the floated icon directly instead of clearing it.
            -->
            <div class="text-muted font-xs">
              <b-row>
                <b-col class="text-lowercase fw-bold" md="auto">
                  <span v-for="tag in project.tags" :key="tag.name">
                    <b-badge
                      :to="{ name: 'Projects', query: { tags_all: tag.name } }"
                      variant="tag"
                      >{{ tag.name }}</b-badge
                    >
                  </span>
                </b-col>
              </b-row>
            </div>
            <div v-if="!isCollectionProject" class="font-xs mt-1">
              <b-row>
                <b-col md="auto">
                  <span class="text-muted me-1"
                    >{{ $t('message.last_bom_import') }}:</span
                  >
                  <span
                    v-b-tooltip.hover="{
                      title: absoluteTime(project.lastBomImport),
                    }"
                    >{{ relativeTime(project.lastBomImport) }}</span
                  >
                  <span class="text-muted mx-2">&middot;</span>
                  <span class="text-muted me-1"
                    >{{ $t('message.last_analysis') }}:</span
                  >
                  <span
                    v-b-tooltip.hover="{
                      title: absoluteTime(project.lastVulnerabilityAnalysis),
                    }"
                    >{{ relativeTime(project.lastVulnerabilityAnalysis) }}</span
                  >
                  <span
                    v-if="isAnalysisRequested"
                    class="text-muted fst-italic ms-2"
                    >&middot; {{ $t('message.analysis_requested') }}</span
                  >
                </b-col>
              </b-row>
            </div>
          </b-col>
          <b-col md="auto">
            <div class="d-none d-md-flex float-end">
              <severity-circles
                :critical="currentCritical"
                :high="currentHigh"
                :medium="currentMedium"
                :low="currentLow"
                :unassigned="currentUnassigned"
              />
            </div>
          </b-col>
        </b-row>
      </b-card-body>
      <template v-slot:footer>
        <div id="project-info-footer">
          <b-row align-v="center">
            <b-col>
              <b-link
                class="fw-bold font-xs text-muted"
                @click="initializeProjectDetailsModal"
                >{{ $t('message.view_details') }}
                <i class="fa fa-angle-right font-lg"></i
              ></b-link>
            </b-col>
            <b-col md="auto" class="btn-spaced-group text-end">
              <b-button
                id="upload-bom-button"
                v-if="!isCollectionProject"
                variant="primary"
                @click="showProjectUploadBomModal = true"
                v-permission="PERMISSIONS.BOM_UPLOAD"
              >
                <span class="fa fa-upload"></span>
                {{ $t('message.upload_bom') }}
              </b-button>
              <b-tooltip target="upload-bom-button">{{
                $t('message.upload_bom_tooltip')
              }}</b-tooltip>

              <b-button
                id="apply-vex-button"
                v-if="!isCollectionProject"
                variant="outline-primary"
                @click="showProjectUploadVexModal = true"
                v-permission:or="[
                  PERMISSIONS.VULNERABILITY_ANALYSIS,
                  PERMISSIONS.VULNERABILITY_ANALYSIS_UPDATE,
                ]"
              >
                <span class="fa fa-upload"></span> {{ $t('message.apply_vex') }}
              </b-button>
              <b-tooltip target="apply-vex-button">{{
                $t('message.apply_vex_tooltip')
              }}</b-tooltip>

              <b-button
                v-if="!isCollectionProject"
                variant="outline-primary"
                @click="showProjectExportModal = true"
                v-permission:or="[
                  PERMISSIONS.VIEW_PORTFOLIO,
                  PERMISSIONS.VIEW_VULNERABILITY,
                  PERMISSIONS.VULNERABILITY_ANALYSIS,
                  PERMISSIONS.VULNERABILITY_ANALYSIS_READ,
                ]"
              >
                <span class="fa fa-download"></span> {{ $t('message.export') }}
              </b-button>

              <b-button
                id="reanalyze-button"
                v-if="!isCollectionProject"
                variant="outline-primary"
                @click="reAnalyze()"
                :disabled="isAnalysisRequested"
                v-permission="PERMISSIONS.VULNERABILITY_ANALYSIS"
              >
                <span class="fa fa-refresh"></span>
                {{ $t('message.project_reanalyze') }}
              </b-button>
              <b-tooltip
                v-if="!isAnalysisRequested"
                target="reanalyze-button"
                >{{ $t('message.project_reanalyze_tooltip') }}</b-tooltip
              >

              <ExternalReferencesDropdown
                v-if="project.externalReferences"
                class="d-none d-md-inline-block"
                size="md"
                :externalReferences="project.externalReferences"
              />
            </b-col>
          </b-row>
        </div>
      </template>
    </b-card>
    <b-tabs v-scrollable-tabs lazy nav-wrapper-class="nav-tabs-scroller">
      <b-tab ref="overview" @click="routeTo()" active>
        <template v-slot:title
          ><i class="fa fa-line-chart"></i>
          {{ $t('message.overview') }}</template
        >
        <project-dashboard :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
      <b-tab
        ref="components"
        @click="routeTo('components')"
        v-if="isShowComponents"
      >
        <template v-slot:title
          ><i class="fa fa-cubes"></i> {{ $t('message.components') }}</template
        >
        <project-components
          :key="this.uuid"
          :uuid="this.uuid"
          :project="this.project"
        />
      </b-tab>
      <b-tab
        ref="collectionprojects"
        @click="routeTo('collectionprojects')"
        v-if="isShowCollectionProjects"
      >
        <template v-slot:title
          ><i class="fa fa-sitemap"></i>
          {{ $t('message.collection_projects') }}</template
        >
        <project-list :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
      <b-tab ref="services" @click="routeTo('services')" v-if="isShowServices">
        <template v-slot:title
          ><i class="fa fa-exchange"></i> {{ $t('message.services') }}</template
        >
        <project-services :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
      <b-tab
        ref="dependencygraph"
        @click="routeTo('dependencyGraph')"
        v-if="isShowDependencyGraph"
      >
        <template v-slot:title
          ><i class="fa fa-sitemap"></i>
          {{ $t('message.dependency_graph') }}</template
        >
        <project-dependency-graph
          :key="this.uuid"
          :uuid="this.uuid"
          :project="this.project"
        />
      </b-tab>
      <b-tab ref="findings" v-if="isShowFindings" @click="routeTo('findings')">
        <template v-slot:title>
          <i class="fa fa-tasks"></i> {{ $t('message.audit_vulnerabilities') }}
        </template>
        <project-findings :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
      <b-tab ref="epss" v-if="isShowFindings" @click="routeTo('epss')">
        <template v-slot:title
          ><i class="fa fa-tasks"></i>
          {{ $t('message.exploit_predictions') }}</template
        >
        <project-epss :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
      <b-tab
        ref="policyviolations"
        v-if="isShowPolicyViolations"
        @click="routeTo('policyViolations')"
      >
        <template v-slot:title
          ><i class="fa fa-fire"></i> {{ $t('message.policy_violations') }}
        </template>
        <project-policy-violations :key="this.uuid" :uuid="this.uuid" />
      </b-tab>
    </b-tabs>
    <project-details-modal
      v-model="showProjectDetailsModal"
      :project-input="project"
      :uuid="this.uuid"
      v-on:projectUpdated="initialize"
      v-on:showProperties="showProjectPropertiesModal = true"
    />
    <project-properties-modal
      v-model="showProjectPropertiesModal"
      :key="this.uuid"
      :uuid="this.uuid"
      v-on:createProperty="showProjectCreatePropertyModal = true"
    />
    <project-create-property-modal
      v-model="showProjectCreatePropertyModal"
      :uuid="this.uuid"
      v-on:propertyCreated="showProjectPropertiesModal = true"
    />
    <project-add-version-modal
      v-model="showProjectAddVersionModal"
      :uuid="this.uuid"
    />
    <project-upload-bom-modal
      v-model="showProjectUploadBomModal"
      :uuid="this.uuid"
    />
    <project-upload-vex-modal
      v-model="showProjectUploadVexModal"
      :uuid="this.uuid"
    />
    <project-export-modal v-model="showProjectExportModal" :uuid="this.uuid" />
  </div>
</template>

<script>
import common from '../../../shared/common';
import { cloneDeep } from 'lodash-es';
import SeverityCircles from '../../components/SeverityCircles.vue';
import ProjectComponents from './ProjectComponents.vue';
import ProjectList from './ProjectList.vue';
import ProjectDependencyGraph from './ProjectDependencyGraph.vue';
import ProjectServices from './ProjectServices.vue';
import ProjectDashboard from './ProjectDashboard.vue';
import EventBus from '../../../shared/eventbus';
import { setPageTitle } from '../../../shared/utils';
import permissionsMixin from '../../../mixins/permissionsMixin';
import ProjectDetailsModal from './ProjectDetailsModal.vue';
import ProjectPropertiesModal from './ProjectPropertiesModal.vue';
import ProjectCreatePropertyModal from './ProjectCreatePropertyModal.vue';
import ProjectAddVersionModal from './ProjectAddVersionModal.vue';
import ProjectUploadBomModal from './ProjectUploadBomModal.vue';
import ProjectUploadVexModal from './ProjectUploadVexModal.vue';
import ProjectExportModal from './ProjectExportModal.vue';
import ProjectFindings from './ProjectFindings.vue';
import ProjectPolicyViolations from './ProjectPolicyViolations.vue';
import ProjectEpss from './ProjectEpss.vue';
import ExternalReferencesDropdown from '../../components/ExternalReferencesDropdown.vue';

export default {
  mixins: [permissionsMixin],
  components: {
    ProjectPolicyViolations,
    ProjectFindings,
    ProjectAddVersionModal,
    ProjectUploadBomModal,
    ProjectUploadVexModal,
    ProjectExportModal,
    ProjectCreatePropertyModal,
    ProjectPropertiesModal,
    ProjectDetailsModal,
    ProjectComponents,
    ProjectList,
    ProjectDependencyGraph,
    ProjectServices,
    ProjectDashboard,
    SeverityCircles,
    ProjectEpss,
    ExternalReferencesDropdown,
  },
  computed: {
    projectLabel() {
      if (this.project.name && this.project.version) {
        return this.project.name + ' ▸ ' + this.project.version;
      } else {
        return this.project.name;
      }
    },
    matchingProjectVersions() {
      const query = this.versionQuery.trim().toLowerCase();
      return (this.project.versions || []).filter((version) =>
        (version.version || '').toLowerCase().includes(query),
      );
    },
    activeProjectVersions() {
      return this.matchingProjectVersions.filter((version) => version.active);
    },
    inactiveProjectVersions() {
      return this.matchingProjectVersions.filter((version) => !version.active);
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
      showProjectDetailsModal: false,
      showProjectPropertiesModal: false,
      showProjectCreatePropertyModal: false,
      showProjectAddVersionModal: false,
      versionQuery: '',
      showProjectUploadBomModal: false,
      showProjectUploadVexModal: false,
      showProjectExportModal: false,
      uuid: null,
      project: {},
      currentCritical: 0,
      currentHigh: 0,
      currentMedium: 0,
      currentLow: 0,
      currentUnassigned: 0,
      currentRiskScore: 0,
      isAnalysisRequested: false,
      nowTick: Date.now(),
      tabIndex: 0,
    };
  },
  methods: {
    cloneDeep: function (component) {
      return cloneDeep(component);
    },
    initialize: function () {
      let projectUrl = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${this.uuid}`;
      return this.axios
        .get(projectUrl)
        .catch((error) => {
          if (this._destroying) {
            return;
          }
          if (error.response.status === 403) {
            this.$router.replace({ name: 'Projects' });
          }
        })
        .then((response) => {
          if (this._destroying) {
            return;
          }
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
          EventBus.emit('addCrumb', this.projectLabel);
          setPageTitle(this.projectLabel);
        });
    },
    initializeProjectDetailsModal: function () {
      EventBus.emit('initializeProjectDetailsModal');
    },
    reAnalyze: function () {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}/analyze`;
      this.axios
        .post(url, null, {
          // 409 means an analysis is already running, which gets its own
          // message rather than the generic error toast.
          validateStatus: (status) =>
            status === 409 || (status >= 200 && status < 300),
        })
        .then((response) => {
          if (response.status === 409) {
            this.$toastr.i(this.$t('message.project_reanalyze_in_progress'));
            return;
          }
          this.isAnalysisRequested = true;
          this.$toastr.s(this.$t('message.project_reanalyze_requested'));
        });
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
    focusVersionFilter() {
      this.$refs.versionFilter?.focus();
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
    relativeTime: function (timestamp) {
      return timestamp
        ? common.formatRelative(
            this.nowTick - new Date(timestamp).getTime(),
            this.$t.bind(this),
          )
        : 'n/a';
    },
    absoluteTime: function (timestamp) {
      return timestamp ? common.formatTimestamp(timestamp, true) : '';
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
          if (this._destroying) {
            return;
          }
          if (this.$route.params.componentUuids) {
            this.$refs.dependencygraph.activate();
          } else {
            this.getTabFromRoute().activate();
          }
        });
      })
      .catch((e) => {
        if (this._destroying) {
          return;
        }
        console.error(e);
        this.$toastr.e(this.$t('condition.forbidden'));
        this.$router.replace({ path: '/projects/' + this.uuid });
        this.$refs.overview.activate();
      });
  },
  beforeUnmount() {
    this._destroying = true;
  },
  watch: {
    $route(to, from) {
      if (!to.params.uuid) {
        return;
      }
      this.uuid = this.$route.params.uuid;
      if (to.params.uuid !== from.params.uuid) {
        this.versionQuery = '';
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
  unmounted() {
    EventBus.emit('crumble');
  },
};
</script>

<style scoped>
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
