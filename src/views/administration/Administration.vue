<template>
  <div class="animated fadeIn" v-permission="'SYSTEM_CONFIGURATION'">
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
import Email from './configuration/Email';
import General from './configuration/General';
import InternalComponents from './configuration/InternalComponents';
import Jira from './configuration/JiraConfig';
import Search from './configuration/Search.vue';
import TaskScheduler from './configuration/TaskScheduler.vue';
import Experimental from './configuration/Experimental.vue';
// Analyzer plugins
import InternalAnalyzer from './analyzers/InternalAnalyzer';
import OssIndexAnalyzer from './analyzers/OssIndexAnalyzer';
import SnykAnalyzer from './analyzers/SnykAnalyzer';
import TrivyAnalyzer from './analyzers/TrivyAnalyzer';
import VulnDbAnalyzer from './analyzers/VulnDbAnalyzer';
// Vulnerability sources
import VulnSourceGitHubAdvisories from './vuln-sources/VulnSourceGitHubAdvisories';
import VulnSourceNvd from './vuln-sources/VulnSourceNvd';
import VulnSourceOSVAdvisories from './vuln-sources/VulnSourceOSVAdvisories';
// Repositories
import Cargo from './repositories/Cargo';
import Composer from './repositories/Composer';
import Cpan from './repositories/Cpan';
import Gem from './repositories/Gem';
import GitHub from './repositories/GitHub.vue';
import GoModules from './repositories/GoModules';
import Hex from './repositories/Hex';
import Maven from './repositories/Maven';
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

export default {
  components: {
    EventBus,
    AdminMenu,
    General,
    BomFormats,
    Email,
    Jira,
    InternalComponents,
    TaskScheduler,
    Search,
    Experimental,
    InternalAnalyzer,
    OssIndexAnalyzer,
    VulnDbAnalyzer,
    SnykAnalyzer,
    TrivyAnalyzer,
    VulnSourceNvd,
    VulnSourceGitHubAdvisories,
    VulnSourceOSVAdvisories,
    Cargo,
    Composer,
    Gem,
    GitHub,
    GoModules,
    Hex,
    Maven,
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
  },
  created() {
    // Specifies the admin plugin metadata (Vue component, i18n name, and href) of the plugin to load
    EventBus.$on('admin:plugin', (plugin) => {
      this.selectedComponent = plugin.component;
      this.header = plugin.name;
      this.href = plugin.href;
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
