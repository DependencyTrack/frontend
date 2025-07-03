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
import EventBus from '@/shared/eventbus';
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
import WelcomeMessage from './configuration/WelcomeMessage.vue';
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
import { BCol, BRow } from 'bootstrap-vue';
import { RouterView } from 'vue-router';

export default {
  components: {
    AdminMenu,
    // eslint-disable-next-line vue/no-unused-components
    General,
    // eslint-disable-next-line vue/no-unused-components
    WelcomeMessage,
    // eslint-disable-next-line vue/no-unused-components
    BomFormats,
    // eslint-disable-next-line vue/no-unused-components
    Email,
    // eslint-disable-next-line vue/no-unused-components
    Jira,
    // eslint-disable-next-line vue/no-unused-components
    InternalComponents,
    // eslint-disable-next-line vue/no-unused-components
    TaskScheduler,
    // eslint-disable-next-line vue/no-unused-components
    Search,
    // eslint-disable-next-line vue/no-unused-components
    Experimental,
    // eslint-disable-next-line vue/no-unused-components
    InternalAnalyzer,
    // eslint-disable-next-line vue/no-unused-components
    OssIndexAnalyzer,
    // eslint-disable-next-line vue/no-unused-components
    VulnDbAnalyzer,
    // eslint-disable-next-line vue/no-unused-components
    SnykAnalyzer,
    // eslint-disable-next-line vue/no-unused-components
    TrivyAnalyzer,
    // eslint-disable-next-line vue/no-unused-components
    VulnSourceNvd,
    // eslint-disable-next-line vue/no-unused-components
    VulnSourceGitHubAdvisories,
    // eslint-disable-next-line vue/no-unused-components
    VulnSourceOSVAdvisories,
    // eslint-disable-next-line vue/no-unused-components
    Cargo,
    // eslint-disable-next-line vue/no-unused-components
    Composer,
    // eslint-disable-next-line vue/no-unused-components
    Gem,
    // eslint-disable-next-line vue/no-unused-components
    GitHub,
    // eslint-disable-next-line vue/no-unused-components
    GoModules,
    // eslint-disable-next-line vue/no-unused-components
    Hackage,
    // eslint-disable-next-line vue/no-unused-components
    Hex,
    // eslint-disable-next-line vue/no-unused-components
    Maven,
    // eslint-disable-next-line vue/no-unused-components
    Nixpkgs,
    // eslint-disable-next-line vue/no-unused-components
    Npm,
    // eslint-disable-next-line vue/no-unused-components
    Cpan,
    // eslint-disable-next-line vue/no-unused-components
    Nuget,
    // eslint-disable-next-line vue/no-unused-components
    Python,
    // eslint-disable-next-line vue/no-unused-components
    Alerts,
    // eslint-disable-next-line vue/no-unused-components
    Templates,
    // eslint-disable-next-line vue/no-unused-components
    FortifySsc,
    // eslint-disable-next-line vue/no-unused-components
    DefectDojo,
    // eslint-disable-next-line vue/no-unused-components
    KennaSecurity,
    // eslint-disable-next-line vue/no-unused-components
    LdapUsers,
    // eslint-disable-next-line vue/no-unused-components
    ManagedUsers,
    // eslint-disable-next-line vue/no-unused-components
    OidcUsers,
    // eslint-disable-next-line vue/no-unused-components
    OidcGroups,
    // eslint-disable-next-line vue/no-unused-components
    Teams,
    // eslint-disable-next-line vue/no-unused-components
    Permissions,
    // eslint-disable-next-line vue/no-unused-components
    PortfolioAccessControl,
    BRow,
    BCol,
    RouterView,
  },
  data() {
    // Default to loading the General plugin first
    return {
      selectedComponent: 'General',
      header: this.$t('admin.general'),
      href: '#generalConfigTab',
    };
  },
  created() {
    // Specifies the admin plugin metadata (Vue component, i18n name, and href) of the plugin to load
    EventBus.$on('admin:plugin', (plugin) => {
      this.selectedComponent = plugin.component;
      this.header = plugin.name;
      this.href = plugin.href;
    });
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
