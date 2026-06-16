<template>
  <div
    class="animated fadeIn"
    v-permission:or="[
      'SYSTEM_CONFIGURATION',
      'SYSTEM_CONFIGURATION_CREATE',
      'SYSTEM_CONFIGURATION_READ',
      'SYSTEM_CONFIGURATION_UPDATE',
      'SYSTEM_CONFIGURATION_DELETE',
    ]"
  >
    <b-row>
      <b-col xs="6" sm="4" md="4" lg="3" id="admin-menu-column">
        <admin-menu />
      </b-col>
      <b-col xs="6" sm="8" md="8" lg="9">
        <div class="tab-content">
          <!-- Dynamically loads the selected admin plugin -->
          <router-view class="animated fadeIn" :header="header" />
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import EventBus from '../../shared/eventbus';
import AdminMenu from './AdminMenu';

// Configuration plugins
import BomFormats from './configuration/BomFormats';
import General from './configuration/General';
import InternalComponents from './configuration/InternalComponents';
import RiskScore from './configuration/RiskScore.vue';
import Telemetry from './configuration/Telemetry.vue';
import WelcomeMessage from './configuration/WelcomeMessage.vue';
import Banner from './configuration/BannerConfiguration.vue';
// Secrets plugins
import SecretsManagement from './secrets/SecretsManagement.vue';
// Repositories
import Cargo from './repositories/Cargo';
import Composer from './repositories/Composer';
import Cpan from './repositories/Cpan';
import Gem from './repositories/Gem';
import GitHub from './repositories/GitHub.vue';
import GoModules from './repositories/GoModules';
import Hackage from './repositories/Hackage.vue';
import Hex from './repositories/Hex';
import Maven from './repositories/Maven';
import Nixpkgs from './repositories/Nixpkgs.vue';
import Npm from './repositories/Npm';
import Nuget from './repositories/Nuget';
import Python from './repositories/Python';
// Notification plugins
import Alerts from './notifications/Alerts';
import Templates from './notifications/Templates';
// Integration plugins
import DefectDojo from './integrations/DefectDojo';
import FortifySsc from './integrations/FortifySsc';
import KennaSecurity from './integrations/KennaSecurity';
// Access Management plugins
import LdapUsers from './accessmanagement/LdapUsers';
import ManagedUsers from './accessmanagement/ManagedUsers';
import OidcGroups from './accessmanagement/OidcGroups';
import OidcUsers from './accessmanagement/OidcUsers';
import Permissions from './accessmanagement/Permissions';
import PortfolioAccessControl from './accessmanagement/PortfolioAccessControl';
import Teams from './accessmanagement/Teams';
// Workflow plugins
import TaskQueueList from '@/views/administration/workflows/TaskQueueList.vue';
import WorkflowRunDetail from '@/views/administration/workflows/WorkflowRunDetail.vue';
import WorkflowRunList from '@/views/administration/workflows/WorkflowRunList.vue';

export default {
  components: {
    EventBus,
    AdminMenu,
    General,
    WelcomeMessage,
    Banner,
    BomFormats,
    InternalComponents,
    Telemetry,
    RiskScore,
    SecretsManagement,
    Cargo,
    Composer,
    Gem,
    GitHub,
    GoModules,
    Hackage,
    Hex,
    Maven,
    Nixpkgs,
    Npm,
    Cpan,
    Nuget,
    Python,
    Alerts,
    Templates,
    FortifySsc,
    DefectDojo,
    KennaSecurity,
    LdapUsers,
    ManagedUsers,
    OidcUsers,
    OidcGroups,
    Teams,
    Permissions,
    PortfolioAccessControl,
    TaskQueueList,
    WorkflowRunDetail,
    WorkflowRunList,
  },
  created() {
    // Specifies the admin plugin metadata (Vue component, i18n name, and href) of the plugin to load
    EventBus.$on('admin:plugin', (plugin) => {
      if (plugin.component) {
        this.selectedComponent = plugin.component;
      }
      this.header = plugin.name;
      if (plugin.href) {
        this.href = plugin.href;
      }
    });
  },
  data() {
    // Default to loading the General plugin first
    return {
      selectedComponent: 'General',
      header: this.$t('admin.general'),
      href: '#generalConfigTab',
    };
  },
};
</script>

<style>
.tab-content {
  border: 0;
}
.tab-content .tab-pane {
  padding: 0;
}
.card-header {
  font-weight: 700;
}
@media only screen and (min-device-width: 600px) {
  #admin-menu-column {
    max-width: 280px;
  }
}
</style>
