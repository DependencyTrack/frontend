<template>
  <div class="animated fadeIn" v-permission="PERMISSIONS.VIEW_PORTFOLIO">
    <b-card :no-body="true" footer-class="px-3 py-2 card-footer-action">
      <b-card-body class="p-3 clearfix">
        <b-row>
          <b-col>
            <i
              class="fa fa-cube page-header-icon p-3 font-2xl me-3 float-start"
            ></i>
            <div class="h5 mb-0 mt-2">
              {{ componentLabel }}&nbsp;
              <b-badge
                :variant="component.isInternal ? 'tab-total' : 'tab-info'"
                v-b-tooltip.hover="$t('message.component_classification_desc')"
                >{{ component.isInternal ? 'INTERNAL' : 'EXTERNAL' }}</b-badge
              >
              <b-badge></b-badge>
            </div>
            <i
              class="fa fa-sitemap"
              style="cursor: pointer"
              aria-hidden="true"
              @click="this.redirectToDependencyGraph"
              v-b-tooltip.hover.bottom="$t('message.show_in_dependency_graph')"
            ></i>
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
        <div id="component-info-footer">
          <b-row>
            <b-col>
              <b-link
                class="fw-bold font-xs d-block w-100 text-muted"
                role="button"
                @click="showComponentDetailsModal = true"
                >{{ $t('message.view_details') }}
                <i class="fa fa-angle-right float-end font-lg"></i
              ></b-link>
            </b-col>
            <b-col v-if="component.externalReferences" md="auto">
              <div class="d-none d-md-flex float-end">
                <ExternalReferencesDropdown
                  :externalReferences="component.externalReferences"
                />
              </div>
            </b-col>
          </b-row>
        </div>
      </template>
    </b-card>
    <b-tabs>
      <b-tab ref="overview" active @click="routeTo()">
        <template v-slot:title
          ><i class="fa fa-line-chart"></i>
          {{ $t('message.overview') }}</template
        >
        <component-dashboard />
      </b-tab>
      <b-tab ref="vulnerabilities" @click="routeTo('vulnerabilities')">
        <template v-slot:title
          ><i class="fa fa-shield"></i> {{ $t('message.vulnerabilities') }}
          <b-badge variant="tab-total">{{
            totalVulnerabilities
          }}</b-badge></template
        >
        <component-vulnerabilities
          :key="this.uuid"
          :uuid="this.uuid"
          v-on:total="totalVulnerabilities = $event"
        />
      </b-tab>
    </b-tabs>
    <component-details-modal
      v-model="showComponentDetailsModal"
      :component="cloneDeep(component)"
      v-on:componentUpdated="loadComponent"
      v-on:showProperties="showComponentPropertiesModal = true"
    />
    <component-properties-modal
      v-model="showComponentPropertiesModal"
      :uuid="this.uuid"
      v-on:createProperty="showComponentCreatePropertyModal = true"
    />
    <component-create-property-modal
      v-model="showComponentCreatePropertyModal"
      :uuid="this.uuid"
      v-on:propertyCreated="showComponentPropertiesModal = true"
    />
  </div>
</template>

<script>
import common from '../../../shared/common';
import { cloneDeep } from 'lodash-es';
import SeverityCircles from '../../components/SeverityCircles.vue';
import ComponentDashboard from './ComponentDashboard.vue';
import ComponentVulnerabilities from './ComponentVulnerabilities.vue';
import EventBus from '../../../shared/eventbus';
import { setPageTitle } from '../../../shared/utils';
import permissionsMixin from '../../../mixins/permissionsMixin';
import ComponentDetailsModal from './ComponentDetailsModal.vue';
import ExternalReferencesDropdown from '../../components/ExternalReferencesDropdown.vue';
import ComponentCreatePropertyModal from './ComponentCreatePropertyModal.vue';
import ComponentPropertiesModal from './ComponentPropertiesModal.vue';

export default {
  mixins: [permissionsMixin],
  components: {
    ComponentCreatePropertyModal,
    ComponentPropertiesModal,
    ComponentDashboard,
    ComponentVulnerabilities,
    SeverityCircles,
    ComponentDetailsModal,
    ExternalReferencesDropdown,
  },
  computed: {
    projectLabel() {
      if (Object.hasOwn(this.component, 'project')) {
        if (this.component.project.name && this.component.project.version) {
          return (
            this.component.project.name + ' ▸ ' + this.component.project.version
          );
        } else {
          return this.component.project.name;
        }
      }
      return null;
    },
    componentLabel() {
      let label = this.component.name;

      if (this.component.group) {
        label = this.component.group + ' ▸ ' + label;
      }

      if (this.component.version) {
        label = label + ' ▸ ' + this.component.version;
      }

      return label;
    },
  },
  data() {
    return {
      showComponentDetailsModal: false,
      showComponentPropertiesModal: false,
      showComponentCreatePropertyModal: false,
      uuid: null,
      component: {},
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
    cloneDeep: function (component) {
      return cloneDeep(component);
    },
    loadComponent: function () {
      let componentUrl = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${this.uuid}`;
      this.axios.get(componentUrl).then((response) => {
        this.component = response.data;
        EventBus.emit(
          'addCrumb',
          this.componentLabel,
          'Project',
          this.component.project.uuid,
          this.projectLabel,
        );
        setPageTitle(this.componentLabel);
      });
    },
    redirectToDependencyGraph: function () {
      this.$router.push({
        path:
          '/projects/' +
          this.component.project.uuid +
          '/dependencyGraph/' +
          this.component.uuid,
      });
    },
    routeTo(path) {
      if (path) {
        if (
          !this.$route.fullPath.toLowerCase().includes('/' + path.toLowerCase())
        ) {
          this.$router.push({ path: '/components/' + this.uuid + '/' + path });
        }
      } else if (
        this.$route.fullPath !== '/components/' + this.uuid &&
        this.$route.fullPath !== '/components/' + this.uuid + '/'
      ) {
        this.$router.push({ path: '/components/' + this.uuid });
      }
    },
    getTabFromRoute: function () {
      let pattern = new RegExp(
        '/components\\/' + this.uuid + '\\/([^\\/?#]*)',
        'gi',
      );
      let tab = pattern.exec(this.$route.fullPath.toLowerCase());
      return this.$refs[tab && tab[1] ? tab[1].toLowerCase() : 'overview'];
    },
  },
  beforeMount() {
    this.uuid = this.$route.params.uuid;
  },
  mounted() {
    this.loadComponent();

    let metricsUrl = `${this.$api.BASE_URL}/${this.$api.URL_METRICS}/component/${this.uuid}/current`;
    this.axios.get(metricsUrl).then((response) => {
      this.currentCritical = common.valueWithDefault(response.data.critical, 0);
      this.currentHigh = common.valueWithDefault(response.data.high, 0);
      this.currentMedium = common.valueWithDefault(response.data.medium, 0);
      this.currentLow = common.valueWithDefault(response.data.low, 0);
      this.currentUnassigned = common.valueWithDefault(
        response.data.unassigned,
        0,
      );
      this.currentRiskScore = common.valueWithDefault(
        response.data.inheritedRiskScore,
        0,
      );
    });

    // <b-tabs> registers its tabs after this hook.
    this.$nextTick(() => this.getTabFromRoute().activate());
  },
  watch: {
    $route() {
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
</style>
