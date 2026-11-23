<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i
              class="fa fa-exchange page-header-icon p-3 font-2xl me-3 float-start"
            ></i>
            <div class="h5 mb-0 mt-2">{{ serviceLabel }}</div>
          </b-col>
          <b-col>
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
        <div id="service-info-footer">
          <b-link
            class="fw-bold font-xs d-block w-100 text-muted"
            role="button"
            @click="showServiceDetailsModal = true"
            >{{ $t('message.view_details') }}
            <i class="fa fa-angle-right float-end font-lg"></i
          ></b-link>
        </div>
      </template>
    </b-card>
    <b-tabs>
      <b-tab active>
        <template v-slot:title
          ><i class="fa fa-line-chart"></i>
          {{ $t('message.overview') }}</template
        >
        <service-dashboard />
      </b-tab>
    </b-tabs>
    <service-details-modal
      v-model="showServiceDetailsModal"
      :service="cloneDeep(service)"
      v-on:serviceUpdated="loadService"
    />
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import SeverityCircles from '../../components/SeverityCircles.vue';
import ServiceDashboard from './ServiceDashboard.vue';
import EventBus from '../../../shared/eventbus';
import { setPageTitle } from '../../../shared/utils';
import permissionsMixin from '../../../mixins/permissionsMixin';
import ServiceDetailsModal from './ServiceDetailsModal.vue';

export default {
  mixins: [permissionsMixin],
  components: {
    ServiceDashboard,
    SeverityCircles,
    ServiceDetailsModal,
  },
  computed: {
    projectLabel() {
      if (Object.hasOwn(this.service, 'project')) {
        if (this.service.project.name && this.service.project.version) {
          return (
            this.service.project.name + ' ▸ ' + this.service.project.version
          );
        } else {
          return this.service.project.name;
        }
      }
      return null;
    },
    serviceLabel() {
      if (this.service.name && this.service.version) {
        return this.service.name + ' ▸ ' + this.service.version;
      } else {
        return this.service.name;
      }
    },
  },
  data() {
    return {
      showServiceDetailsModal: false,
      uuid: null,
      service: {},
      currentCritical: 0,
      currentHigh: 0,
      currentMedium: 0,
      currentLow: 0,
      currentUnassigned: 0,
      currentRiskScore: 0,
      totalVulnerabilities: 0,
      totalProjects: 0,
    };
  },
  methods: {
    cloneDeep: function (service) {
      return cloneDeep(service);
    },
    loadService: function () {
      let serviceUrl = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/${this.uuid}`;
      this.axios.get(serviceUrl).then((response) => {
        this.service = response.data;
        EventBus.emit(
          'addCrumb',
          this.serviceLabel,
          'Project',
          this.service.project.uuid,
          this.projectLabel,
        );
        setPageTitle(this.serviceLabel);
      });
    },
  },
  beforeMount() {
    this.uuid = this.$route.params.uuid;
  },
  mounted() {
    this.loadService();
    /* TODO: Add when server supports service metrics
    let metricsUrl = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/service/${this.uuid}/current`;
    this.axios.get(metricsUrl).then((response) => {
      this.currentCritical = common.valueWithDefault(response.data.critical, 0);
      this.currentHigh = common.valueWithDefault(response.data.high, 0);
      this.currentMedium = common.valueWithDefault(response.data.medium, 0);
      this.currentLow = common.valueWithDefault(response.data.low, 0);
      this.currentUnassigned = common.valueWithDefault(response.data.unassigned, 0);
      this.currentRiskScore = common.valueWithDefault(response.data.inheritedRiskScore, 0);
    });
 */
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
</style>
