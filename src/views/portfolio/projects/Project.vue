<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i class="fa fa-sitemap bg-primary p-3 font-2xl mr-3 float-left"></i>
            <div class="h5 mb-0 mt-2">
              {{ project.name }}
              <ol v-if="project.version" style="display: inline-block; margin: 0; list-style-type: none; padding-inline-start: 0">
                <li class="dropdown">
                  <a href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fa fa-caret-down" aria-hidden="true" style="padding-left:10px; padding-right:10px; padding-top:3px; padding-bottom:3px;"></i></a>
                  <ul class="dropdown-menu">
                    <span v-for="p in availableProjectVersions">
                      <b-dropdown-item :to="{name: 'Project', params: {uuid: p.uuid}}">{{ p.version }}</b-dropdown-item>
                      </span>
                  </ul>
                </li>
              </ol>
              {{ project.version }}
            </div>
            <div class="text-muted text-uppercase font-weight-bold font-xs">
              <span v-for="tag in project.tags">
                <b-badge :to="{name: 'Projects', query: {tag: tag.name}}" variant="tag">{{ tag.name }}</b-badge>
              </span>
            </div>
          </b-col>
          <b-col>
            <b-row class="d-none d-md-flex float-right">
              <vue-easy-pie-chart style="margin-right: 1rem"
                                  :bar-color="severityCritical"
                                  font-size="14px"
                                  :track-color="trackColor"
                                  scale-color=""
                                  line-cap="round"
                                  :line-width="3"
                                  :percent="100"
                                  :size="50"
                                  :animate="true"
                                  v-b-tooltip.hover :title="$t('severity.critical')"
              >{{ currentCritical }}</vue-easy-pie-chart>
              <vue-easy-pie-chart style="margin-right: 1rem"
                                  :bar-color="severityHigh"
                                  font-size="14px"
                                  :track-color="trackColor"
                                  scale-color=""
                                  line-cap="round"
                                  :line-width="3"
                                  :percent="100"
                                  :size="50"
                                  :animate="true"
                                  v-b-tooltip.hover :title="$t('severity.high')"
              >{{ currentHigh }}</vue-easy-pie-chart>
              <vue-easy-pie-chart style="margin-right: 1rem"
                                  :bar-color="severityMedium"
                                  font-size="14px"
                                  :track-color="trackColor"
                                  scale-color=""
                                  line-cap="round"
                                  :line-width="3"
                                  :percent="100"
                                  :size="50"
                                  :animate="true"
                                  v-b-tooltip.hover :title="$t('severity.medium')"
              >{{ currentMedium }}</vue-easy-pie-chart>
              <vue-easy-pie-chart style="margin-right: 1rem"
                                  :bar-color="severityLow"
                                  font-size="14px"
                                  :track-color="trackColor"
                                  scale-color=""
                                  line-cap="round"
                                  :line-width="3"
                                  :percent="100"
                                  :size="50"
                                  :animate="true"
                                  v-b-tooltip.hover :title="$t('severity.low')"
              >{{ currentLow }}</vue-easy-pie-chart>
              <vue-easy-pie-chart style="margin-right: 1rem"
                                  :bar-color="severityUnassigned"
                                  font-size="14px"
                                  :track-color="trackColor"
                                  scale-color=""
                                  line-cap="round"
                                  :line-width="3"
                                  :percent="100"
                                  :size="50"
                                  :animate="true"
                                  v-b-tooltip.hover :title="$t('severity.unassigned')"
              >{{ currentUnassigned }}</vue-easy-pie-chart>
            </b-row>
          </b-col>
        </b-row>
      </b-card-body>
      <div id="project-info-footer" slot="footer">
        <b-link class="font-weight-bold font-xs btn-block text-muted" v-b-modal.projectDetailsModal>{{ $t('message.view_details') }} <i class="fa fa-angle-right float-right font-lg"></i></b-link>
      </div>
    </b-card>
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color overview-chart" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title><i class="fa fa-line-chart"></i> {{ $t('message.overview') }}</template>
        <project-dashboard :uuid="this.project.uuid" style="border-left: 0; border-right:0; border-top:0" v-if="this.project.uuid" />
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-cubes"></i> {{ $t('message.components') }} <b-badge variant="tab-total">{{ totalComponents }}</b-badge></template>
        <project-components :key="this.project.uuid" :uuid="this.project.uuid" v-on:total="totalComponents = $event" v-if="this.project.uuid" />
      </b-tab>
      <b-tab v-if="isPermitted(PERMISSIONS.VULNERABILITY_ANALYSIS)">
        <template v-slot:title><i class="fa fa-tasks"></i> {{ $t('message.audit_vulnerabilities') }} <b-badge variant="tab-total">{{ totalFindings }}</b-badge></template>
        <project-findings :key="this.project.uuid" :uuid="this.project.uuid" v-on:total="totalFindings = $event" v-if="this.project.uuid" />
      </b-tab>
      <b-tab v-if="isPermitted(PERMISSIONS.POLICY_VIOLATION_ANALYSIS)">
        <template v-slot:title><i class="fa fa-fire"></i> {{ $t('message.policy_violations') }} <b-badge variant="tab-total">{{ totalViolations }}</b-badge></template>
        <project-policy-violations :key="this.project.uuid" :uuid="this.project.uuid" v-on:total="totalViolations = $event" v-if="this.project.uuid" />
      </b-tab>
    </b-tabs>
    <project-details-modal :project="cloneDeep(project)" v-on:projectUpdated="syncProjectFields"/>
    <project-properties-modal :uuid="this.project.uuid" v-if="this.project.uuid" />
    <project-create-property-modal :uuid="this.project.uuid" v-if="this.project.uuid" />
    <project-add-version-modal :uuid="this.project.uuid" v-if="this.project.uuid" />
  </div>
</template>

<script>
  import common from "../../../shared/common"
  import { cloneDeep } from 'lodash-es';
  import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities'
  import VueEasyPieChart from 'vue-easy-pie-chart'
  import ProjectComponents from "./ProjectComponents";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import ProjectDashboard from "./ProjectDashboard";
  import SeverityBarChart from "../../dashboard/SeverityBarChart";
  import EventBus from '../../../shared/eventbus';
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import ProjectDetailsModal from "./ProjectDetailsModal";
  import ProjectPropertiesModal from "./ProjectPropertiesModal";
  import ProjectCreatePropertyModal from "./ProjectCreatePropertyModal";
  import ProjectAddVersionModal from "./ProjectAddVersionModal";
  import ProjectFindings from "./ProjectFindings";
  import ProjectPolicyViolations from "./ProjectPolicyViolations";

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
      SeverityBarChart,
      ProjectDashboard,
      PortfolioWidgetRow,
      VueEasyPieChart
    },
    computed: {
      projectLabel () {
        if (this.project.name && this.project.version) {
          return this.project.name + ' ▸ ' + this.project.version;
        } else {
          return this.project.name;
        }
      }
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
        availableProjectVersions: [],
        totalComponents: 0,
        totalFindings: 0,
        totalViolations: 0
      }
    },
    methods: {
      cloneDeep: function(component) {
        return cloneDeep(component);
      },
      getStyle: function(style) {
        return getStyle(style);
      },
      syncProjectFields: function(project) {
        this.project = project;
        EventBus.$emit('addCrumb', this.projectLabel);
      },
      initialize: function() {
        const projectUrl = this.name && this.version ? `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/lookup` : `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${this.uuid}`;
        const params = this.name && this.version ? {name: this.name, version: this.version} : {};
        this.axios.get(projectUrl, {params}).then(response => {
          this.project = response.data;
          this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`, {
            params: {
              offset: 0,
              limit: 10,
              excludeInactive: true,
              name: response.data.name
            }
          }).then(response => {
            this.availableProjectVersions = response.data;
          });

          this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_METRICS}/project/${response.data.uuid}/current`).then(response => {
            this.currentCritical = common.valueWithDefault(response.data.critical, 0);
            this.currentHigh = common.valueWithDefault(response.data.high, 0);
            this.currentMedium = common.valueWithDefault(response.data.medium, 0);
            this.currentLow = common.valueWithDefault(response.data.low, 0);
            this.currentUnassigned = common.valueWithDefault(response.data.unassigned, 0);
            this.currentRiskScore = common.valueWithDefault(response.data.inheritedRiskScore, 0);
          });

          EventBus.$emit('addCrumb', this.projectLabel);
        });
      }
    },
    beforeMount() {
      this.uuid = this.$route.params.uuid;
      this.name = this.$route.params.name;
      this.version = this.$route.params.version;
    },
    mounted() {
      this.initialize();
    },
    watch:{
      $route (to, from){
        this.uuid = this.$route.params.uuid;
        this.name = this.$route.params.name;
        this.version = this.$route.params.version;
        this.initialize();
      }
    },
    destroyed() {
      EventBus.$emit('crumble');
    }
  };
</script>

<style scoped>
  .overview-chart {
    padding: 0;
  }
  .badge {
    margin-right: .4rem;
  }
</style>
