<template>
  <div class="animated fadeIn">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i class="fa fa-sitemap bg-primary p-3 font-2xl mr-3 float-left"></i>
            <div class="h5 text-primary mb-0 mt-2">{{ projectLabel }}</div>
            <div class="text-muted text-uppercase font-weight-bold font-xs">
              <span v-for="tag in projectTags">
                <b-badge :href="'../projects/?tag='+tag.name" variant="secondary">{{ tag.name }}</b-badge>
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
              >{{ currentUnassigned }}</vue-easy-pie-chart>
            </b-row>
          </b-col>
        </b-row>
      </b-card-body>
      <div id="project-info-footer" slot="footer">
        <b-link class="font-weight-bold font-xs btn-block text-muted" href="#">{{ $t('message.view_details') }} <i class="fa fa-angle-right float-right font-lg"></i></b-link>
      </div>
    </b-card>
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color overview-chart" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title><i class="fa fa-line-chart"></i> {{ $t('message.overview') }}</template>
        <project-dashboard style="border-left: 0; border-right:0; border-top:0 "/>
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-cubes"></i> {{ $t('message.dependencies') }}</template>
        <project-dependencies :uuid="this.uuid"/>
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-tasks"></i> {{ $t('message.audit') }}</template>
        Audit table here
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
  import api from "../../../shared/api";
  import common from "../../../shared/common"
  import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities'
  import VueEasyPieChart from 'vue-easy-pie-chart'
  import ProjectDependencies from "./ProjectDependencies";
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import ProjectDashboard from "./ProjectDashboard";
  import SeverityBarChart from "../../dashboard/SeverityBarChart";
  import EventBus from '../../../shared/eventbus';

  export default {
    components: {
      ProjectDependencies,
      SeverityBarChart,
      ProjectDashboard,
      PortfolioWidgetRow,
      VueEasyPieChart
    },
    computed: {
      projectLabel () {
        if (this.projectName && this.projectVersion) {
          return this.projectName + ' ▸ ' + this.projectVersion;
        } else {
          return this.projectName;
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
        projectName: '',
        projectVersion: '',
        projectTags: [],
        currentCritical: 0,
        currentHigh: 0,
        currentMedium: 0,
        currentLow: 0,
        currentUnassigned: 0,
        currentRiskScore: 0,
      }
    },
    methods: {
      getStyle: function(style) {
        return getStyle(style);
      }
    },
    beforeMount() {
      this.uuid = this.$route.params.uuid;
    },
    mounted() {
      let projectUrl = `${api.BASE_URL}/${api.URL_PROJECT}/${this.uuid}`;
      this.axios.get(projectUrl).then((response) => {
        this.projectName = response.data.name;
        this.projectVersion = response.data.version;
        this.projectTags = response.data.tags;
        EventBus.$emit('addCrumb', this.projectLabel);
      });

      let metricsUrl = `${api.BASE_URL}/${api.URL_METRICS}/project/${this.uuid}/current`;
      this.axios.get(metricsUrl).then((response) => {
        this.currentCritical = common.valueWithDefault(response.data.critical, 0);
        this.currentHigh = common.valueWithDefault(response.data.high, 0);
        this.currentMedium = common.valueWithDefault(response.data.medium, 0);
        this.currentLow = common.valueWithDefault(response.data.low, 0);
        this.currentUnassigned = common.valueWithDefault(response.data.unassigned, 0);
        this.currentRiskScore = common.valueWithDefault(response.data.inheritedRiskScore, 0);
      });
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
