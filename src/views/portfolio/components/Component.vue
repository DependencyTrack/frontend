<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i class="fa fa-cube bg-primary p-3 font-2xl mr-3 float-left"></i>
            <div class="h5 mb-0 mt-2">{{ componentLabel }}</div>
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
      <div id="component-info-footer" slot="footer">
        <b-link class="font-weight-bold font-xs btn-block text-muted" v-b-modal.componentDetailsModal>{{ $t('message.view_details') }} <i class="fa fa-angle-right float-right font-lg"></i></b-link>
      </div>
    </b-card>
    <b-tabs class="body-bg-color" style="border-left: 0; border-right:0; border-top:0 ">
      <b-tab class="body-bg-color overview-chart" style="border-left: 0; border-right:0; border-top:0 " active>
        <template v-slot:title><i class="fa fa-line-chart"></i> {{ $t('message.overview') }}</template>
        <component-dashboard style="border-left: 0; border-right:0; border-top:0 "/>
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-cubes"></i> {{ $t('message.vulnerabilities') }}</template>
        <component-vulnerabilities :uuid="this.uuid"/>
      </b-tab>
      <b-tab v-if="isPermitted(PERMISSIONS.VULNERABILITY_ANALYSIS)">
        <template v-slot:title><i class="fa fa-tasks"></i> {{ $t('message.projects') }}</template>
        <component-projects :uuid="this.uuid" />
      </b-tab>
    </b-tabs>
    <component-details-modal :component="cloneDeep(component)" v-on:componentUpdated="syncComponentFields" />
  </div>
</template>

<script>
  import common from "../../../shared/common"
  import { cloneDeep } from 'lodash-es';
  import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities'
  import VueEasyPieChart from 'vue-easy-pie-chart'
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import ComponentDashboard from "./ComponentDashboard";
  import ComponentProjects from "./ComponentProjects";
  import ComponentVulnerabilities from "./ComponentVulnerabilities";
  import SeverityBarChart from "../../dashboard/SeverityBarChart";
  import EventBus from '../../../shared/eventbus';
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import ComponentDetailsModal from "./ComponentDetailsModal";

  export default {
    mixins: [permissionsMixin],
    components: {
      SeverityBarChart,
      ComponentDashboard,
      ComponentProjects,
      ComponentVulnerabilities,
      PortfolioWidgetRow,
      VueEasyPieChart,
      ComponentDetailsModal
    },
    computed: {
      componentLabel () {
        if (this.component.name && this.component.version) {
          return this.component.name + ' ▸ ' + this.component.version;
        } else {
          return this.component.name;
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
        component: {},
        currentCritical: 0,
        currentHigh: 0,
        currentMedium: 0,
        currentLow: 0,
        currentUnassigned: 0,
        currentRiskScore: 0,
      }
    },
    methods: {
      cloneDeep: function(component) {
        return cloneDeep(component);
      },
      getStyle: function(style) {
        return getStyle(style);
      },
      syncComponentFields: function(component) {
        this.component.name = component.name;
        this.component.version = component.version;
        this.component.group = component.group;
        this.component.description = component.description;
        this.component.license = component.license;
        this.component.resolvedLicense = component.resolvedLicense;
        this.component.filename = component.filename;
        this.component.classifier = component.classifier;
        this.component.purl = component.purl;
        this.component.cpe = component.cpe;
        this.component.copyright = component.copyright;
        this.component.md5 = component.md5;
        this.component.sha1 = component.sha1;
        this.component.sha256 = component.sha256;
        this.component.sha512 = component.sha512;
        this.component.sha3_256 = component.sha3_256;
        this.component.sha3_512 = component.sha3_512;
        EventBus.$emit('addCrumb', this.componentLabel);
      }
    },
    beforeMount() {
      this.uuid = this.$route.params.uuid;
    },
    mounted() {
      let componentUrl = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${this.uuid}`;
      this.axios.get(componentUrl).then((response) => {
        this.component = response.data;
        EventBus.$emit('addCrumb', this.componentLabel);
      });

      let metricsUrl = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/component/${this.uuid}/current`;
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
