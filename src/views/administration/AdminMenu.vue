<template>
  <div>
    <b-card
      no-body
      class="admin-menu"
      v-for="section in menu"
      v-bind:key="section.id"
    >
      <div
        slot="header"
        v-if="isPermitted(section.permission)"
        v-b-toggle="section.id"
        style="cursor: pointer"
      >
        <i class="fa fa-align-justify"></i
        ><strong>&nbsp;&nbsp;{{ section.name }}</strong>
      </div>
      <b-collapse
        ref="accordion"
        v-if="isPermitted(section.permission)"
        :id="section.id"
        accordion="admin-accordion"
        role="tabpanel"
      >
        <div class="list-group" id="list-tab" role="tablist">
          <router-link
            :ref="item.id"
            :key="item.id"
            v-for="item in section.children"
            class="list-group-item list-group-item-action"
            data-toggle="list"
            role="tab"
            :hidden="item.hidden"
            :to="'/admin/' + item.route"
            @click="emitEvent(item)"
            >{{ item.name }}</router-link
          >
        </div>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import permissionsMixin from '../../mixins/permissionsMixin';
import EventBus from '../../shared/eventbus';
import {
  ACCESS_MANAGEMENT,
  SYSTEM_CONFIGURATION,
} from '../../shared/permissions';

export default {
  mixins: [permissionsMixin],
  components: {
    EventBus,
  },
  methods: {
    emitEvent: function (plugin) {
      EventBus.$emit('admin:plugin', plugin);
    },
    getMenuFromRoute: function () {
      let pattern = new RegExp('/admin\\/([^\\/]*)', 'gi');
      let tab = pattern.exec(this.$route.fullPath.toLowerCase());
      return tab && tab[1] ? tab[1].toLowerCase() : 'configuration';
    },
  },
  mounted() {
    this.$root.$emit('bv::toggle::collapse', this.getMenuFromRoute());
  },
  watch: {
    $route() {
      this.$refs.accordion.forEach((menu) => (menu.show = false));
      this.$root.$emit('bv::toggle::collapse', this.getMenuFromRoute());
    },
  },
  data() {
    return {
      menu: [
        {
          name: this.$t('admin.configuration'),
          id: 'configuration',
          permission: SYSTEM_CONFIGURATION,
          children: [
            {
              component: 'General',
              name: this.$t('admin.general'),
              route: 'configuration/general',
            },
            {
              component: 'BomFormats',
              name: this.$t('admin.bom_formats'),
              route: 'configuration/bomFormats',
            },
            {
              component: 'Email',
              name: this.$t('admin.email'),
              route: 'configuration/email',
            },
            {
              component: 'WelcomeMessage',
              name: this.$t('admin.welcome_message'),
              route: 'configuration/welcomeMessage',
            },
            {
              component: 'InternalComponents',
              name: this.$t('admin.internal_components'),
              route: 'configuration/internalComponents',
            },
            {
              component: 'TaskScheduler',
              name: this.$t('admin.task_scheduler'),
              route: 'configuration/taskScheduler',
            },
            {
              component: 'Search',
              name: this.$t('message.search'),
              route: 'configuration/search',
            },
            {
              component: 'Experimental',
              name: this.$t('admin.experimental'),
              route: 'configuration/experimental',
              hidden: true,
            },
          ],
        },
        {
          name: this.$t('admin.analyzers'),
          id: 'analyzers',
          permission: SYSTEM_CONFIGURATION,
          children: [
            {
              component: 'InternalAnalyzer',
              name: this.$t('admin.internal_analyzer'),
              route: 'analyzers/internal',
            },
            {
              component: 'OssIndexAnalyzer',
              name: this.$t('admin.oss_index'),
              route: 'analyzers/oss',
            },
            {
              component: 'VulnDbAnalyzer',
              name: this.$t('admin.vulndb'),
              route: 'analyzers/vulnDB',
            },
            {
              component: 'SnykAnalyzer',
              name: this.$t('admin.snyk'),
              route: 'analyzers/snyk',
            },
            {
              component: 'TrivyAnalyzer',
              name: this.$t('admin.trivy'),
              route: 'analyzers/trivy',
            },
          ],
        },
        {
          name: this.$t('admin.vuln_sources'),
          id: 'vulnerabilitysources',
          permission: SYSTEM_CONFIGURATION,
          children: [
            {
              component: 'VulnSourceNvd',
              name: this.$t('admin.national_vulnerability_database'),
              route: 'vulnerabilitySources/nvd',
            },
            {
              component: 'VulnSourceGitHubAdvisories',
              name: this.$t('admin.github_advisories'),
              route: 'vulnerabilitySources/github',
            },
            {
              component: 'VulnSourceOSVAdvisories',
              name: this.$t('admin.osv_advisories'),
              route: 'vulnerabilitySources/osv',
            },
          ],
        },
        {
          name: this.$t('admin.repositories'),
          id: 'repositories',
          permission: SYSTEM_CONFIGURATION,
          children: [
            {
              component: 'Cargo',
              name: this.$t('admin.cargo'),
              route: 'repositories/cargo',
            },
            {
              component: 'Composer',
              name: this.$t('admin.composer'),
              route: 'repositories/composer',
            },
            {
              component: 'Cpan',
              name: this.$t('admin.cpan'),
              route: 'repositories/cpan',
            },
            {
              component: 'Gem',
              name: this.$t('admin.gem'),
              route: 'repositories/gem',
            },
            {
              component: 'GitHub',
              name: this.$t('admin.github'),
              route: 'repositories/github',
            },
            {
              component: 'GoModules',
              name: this.$t('admin.go_modules'),
              route: 'repositories/goModules',
            },
            {
              component: 'Hackage',
              name: this.$t('admin.hackage'),
              route: 'repositories/hackage',
            },
            {
              component: 'Hex',
              name: this.$t('admin.hex'),
              route: 'repositories/hex',
            },
            {
              component: 'Maven',
              name: this.$t('admin.maven'),
              route: 'repositories/maven',
            },
            {
              component: 'Nixpkgs',
              name: this.$t('admin.nixpkgs'),
              route: 'repositories/nixpkgs',
            },
            {
              component: 'Npm',
              name: this.$t('admin.npm'),
              route: 'repositories/npm',
            },
            {
              component: 'Nuget',
              name: this.$t('admin.nuget'),
              route: 'repositories/nuget',
            },
            {
              component: 'Python',
              name: this.$t('admin.python'),
              route: 'repositories/python',
            },
          ],
        },
        {
          name: this.$t('admin.notifications'),
          id: 'notifications',
          permission: SYSTEM_CONFIGURATION,
          children: [
            {
              component: 'Alerts',
              name: this.$t('admin.alerts'),
              route: 'notifications/alerts',
            },
            {
              component: 'Scheduled Alerts',
              name: this.$t('admin.scheduled_alerts'),
              route: 'notifications/scheduledalerts',
            },
            {
              component: 'Templates',
              name: this.$t('admin.templates'),
              route: 'notifications/templates',
            },
          ],
        },
        {
          name: this.$t('admin.integrations'),
          id: 'integrations',
          permission: SYSTEM_CONFIGURATION,
          children: [
            {
              component: 'DefectDojo',
              name: this.$t('admin.defectdojo'),
              route: 'integrations/defectDojo',
            },
            {
              component: 'FortifySsc',
              name: this.$t('admin.fortify_ssc'),
              route: 'integrations/fortifySSC',
            },
            {
              component: 'Jira',
              name: this.$t('admin.jira'),
              route: 'integrations/jira',
            },
            {
              component: 'KennaSecurity',
              name: this.$t('admin.kenna_security'),
              route: 'integrations/kennaSecurity',
            },
          ],
        },
        {
          name: this.$t('admin.access_management'),
          id: 'accessmanagement',
          permission: ACCESS_MANAGEMENT,
          children: [
            {
              component: 'LdapUsers',
              name: this.$t('admin.ldap_users'),
              route: 'accessManagement/ldapUsers',
            },
            {
              component: 'ManagedUsers',
              name: this.$t('admin.managed_users'),
              route: 'accessManagement/managedUsers',
            },
            {
              component: 'OidcUsers',
              name: this.$t('admin.oidc_users'),
              route: 'accessManagement/oidcUsers',
            },
            {
              component: 'OidcGroups',
              name: this.$t('admin.oidc_groups'),
              route: 'accessManagement/oidcGroups',
            },
            {
              component: 'Teams',
              name: this.$t('admin.teams'),
              route: 'accessManagement/teams',
            },
            {
              component: 'Permissions',
              name: this.$t('admin.permissions'),
              route: 'accessManagement/permissions',
            },
            {
              component: 'PortfolioAccessControl',
              name: this.$t('admin.portfolio_access_control'),
              route: 'accessManagement/portfolioAccessControl',
            },
          ],
        },
      ],
    };
  },
};
</script>

<style scoped>
.admin-menu {
  margin-bottom: 0.3rem;
}
.list-group-item:first-child,
.list-group-item:last-child {
  border-radius: 0;
}
.list-group-item {
  border-left: 0;
  border-right: 0;
}
</style>
