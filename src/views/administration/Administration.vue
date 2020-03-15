<template>
  <div class="animated fadeIn" v-permission="'SYSTEM_CONFIGURATION'">
    <b-row>
      <b-col xs="6" sm="4" md="2">
        <admin-menu />
      </b-col>
      <b-col xs="6" sm="8" md="10">
        <div class="tab-content">
          <!-- Dynamically loads the selected admin plugin -->
          <component class="animated fadeIn" :is="selectedComponent" :header="header" />
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import AdminMenu from './AdminMenu'
  import EventBus from "../../shared/eventbus";

  // Configuration plugins
  import General from "./configuration/General";
  import BomFormats from "./configuration/BomFormats";
  import Email from "./configuration/Email";
  import InternalComponents from "./configuration/InternalComponents";
  // Analyzer plugins
  import InternalAnalyzer from "./analyzers/InternalAnalyzer";
  import NpmAuditAnalyzer from "./analyzers/NpmAuditAnalyzer";
  import OssIndexAnalyzer from "./analyzers/OssIndexAnalyzer";
  import VulnDbAnalyzer from "./analyzers/VulnDbAnalyzer";
  // Repositories
  import Gem from "./repositories/Gem";
  import Hex from "./repositories/Hex";
  import Maven from "./repositories/Maven";
  import Npm from "./repositories/Npm";
  import Nuget from "./repositories/Nuget";
  import Python from "./repositories/Python";
  // Notification plugins
  import Alerts from "./notifications/Alerts";
  import Templates from "./notifications/Templates";
  // Integration plugins
  import FortifySsc from "./integrations/FortifySsc";
  import KennaSecurity from "./integrations/KennaSecurity";
  // Access Management plugins
  import LdapUsers from "./accessmanagement/LdapUsers";
  import ManagedUsers from "./accessmanagement/ManagedUsers";
  import OidcUsers from "./accessmanagement/OidcUsers";
  import OidcGroups from "./accessmanagement/OidcGroups";
  import Teams from "./accessmanagement/Teams";
  import Permissions from "./accessmanagement/Permissions";

  export default {
    components: {
      EventBus,
      AdminMenu,
      General, BomFormats, Email, InternalComponents,
      InternalAnalyzer, NpmAuditAnalyzer, OssIndexAnalyzer, VulnDbAnalyzer,
      Gem, Hex, Maven, Npm, Nuget, Python,
      Alerts, Templates,
      FortifySsc, KennaSecurity,
      LdapUsers, ManagedUsers, OidcUsers, OidcGroups, Teams, Permissions
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
        href: '#generalConfigTab'
      }
    }
  }
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
</style>

