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
          <template v-for="item in section.children">
            <div
              v-if="item.header"
              :key="item.id || item.route || item.name"
              class="list-group-item admin-menu-subheader"
            >
              {{ item.name }}
            </div>
            <router-link
              v-else
              :ref="item.id || item.route"
              :key="item.id || item.route"
              class="list-group-item list-group-item-action"
              :class="{
                'admin-menu-item-readonly': item.configurable === false,
              }"
              data-toggle="list"
              role="tab"
              :to="'/admin/' + item.route"
              @click="emitEvent(item)"
            >
              {{ item.name }}
              <i
                v-if="item.configurable === false"
                class="fa fa-info-circle float-right"
                :title="$t('admin.extension_no_config')"
                aria-hidden="true"
              ></i>
            </router-link>
          </template>
        </div>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import common from '../../shared/common';
import permissionsMixin from '../../mixins/permissionsMixin';
import EventBus from '../../shared/eventbus';
import {
  ACCESS_MANAGEMENT,
  ACCESS_MANAGEMENT_CREATE,
  ACCESS_MANAGEMENT_READ,
  ACCESS_MANAGEMENT_UPDATE,
  ACCESS_MANAGEMENT_DELETE,
  SYSTEM_CONFIGURATION,
  SYSTEM_CONFIGURATION_CREATE,
  SYSTEM_CONFIGURATION_READ,
  SYSTEM_CONFIGURATION_UPDATE,
  SYSTEM_CONFIGURATION_DELETE,
  SECRET_MANAGEMENT,
  SECRET_MANAGEMENT_CREATE,
  SECRET_MANAGEMENT_UPDATE,
  SECRET_MANAGEMENT_DELETE,
  SECRET_MANAGEMENT_READ,
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
    fetchExtensions: function (menuId, extensionPoint, routePrefix, header) {
      const section = this.menu.find((s) => s.id === menuId);
      if (!section) return;
      this.axios
        .get(
          `${this.$api.BASE_URL}/api/v2/extension-points/${extensionPoint}/extensions`,
        )
        .then((response) => {
          const extensions = Array.isArray(response.data)
            ? response.data
            : response.data.items || [];
          const fetched = extensions.map((ext) => {
            const encodedName = encodeURIComponent(ext.name);
            const route = routePrefix + '/' + encodedName;
            return {
              id: route,
              name: common.titleCase(ext.name),
              route: route,
              configurable: ext.configurable !== false,
            };
          });
          const existingIds = new Set(section.children.map((c) => c.id));
          const newItems = fetched.filter((c) => !existingIds.has(c.id));
          if (newItems.length === 0) return;
          const headerItem = header
            ? [
                {
                  id: `${menuId}-header-${routePrefix}`,
                  name: header,
                  header: true,
                },
              ]
            : [];
          section.children = [...section.children, ...headerItem, ...newItems];
        })
        .catch((error) => {
          console.error(
            'Failed to load extensions for extension point:',
            extensionPoint,
            error,
          );
        });
    },
  },
  created() {
    this.fetchExtensions('analyzers', 'vuln-analyzer', 'analyzers');
    this.fetchExtensions(
      'vulnerabilitysources',
      'vuln-data-source',
      'vulnerabilitySources',
    );
    this.fetchExtensions(
      'notifications',
      'notification-publisher',
      'notifications/publishers',
      this.$t('admin.publishers'),
    );
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
          permission: [
            SYSTEM_CONFIGURATION,
            SYSTEM_CONFIGURATION_CREATE,
            SYSTEM_CONFIGURATION_READ,
            SYSTEM_CONFIGURATION_UPDATE,
            SYSTEM_CONFIGURATION_DELETE,
          ],
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
              component: 'WelcomeMessage',
              name: this.$t('admin.welcome_message'),
              route: 'configuration/welcomeMessage',
            },
            {
              component: 'Banner',
              name: this.$t('admin.banner'),
              route: 'configuration/banner',
            },
            {
              component: 'InternalComponents',
              name: this.$t('admin.internal_components'),
              route: 'configuration/internalComponents',
            },
            {
              component: 'Maintenance',
              name: this.$t('admin.maintenance'),
              route: 'configuration/maintenance',
            },
            {
              component: 'RiskScore',
              name: this.$t('message.risk_score'),
              route: 'configuration/RiskScore',
            },
            {
              component: 'Telemetry',
              name: this.$t('admin.telemetry'),
              route: 'configuration/telemetry',
            },
          ],
        },
        {
          name: this.$t('admin.secrets'),
          id: 'secrets',
          permission: [
            SECRET_MANAGEMENT,
            SECRET_MANAGEMENT_CREATE,
            SECRET_MANAGEMENT_READ,
            SECRET_MANAGEMENT_UPDATE,
            SECRET_MANAGEMENT_DELETE,
          ],
          children: [
            {
              component: 'SecretsManagement',
              name: this.$t('admin.secrets_management'),
              route: 'secrets/management',
            },
          ],
        },
        {
          name: this.$t('admin.analyzers'),
          id: 'analyzers',
          permission: [
            SYSTEM_CONFIGURATION,
            SYSTEM_CONFIGURATION_CREATE,
            SYSTEM_CONFIGURATION_READ,
            SYSTEM_CONFIGURATION_UPDATE,
            SYSTEM_CONFIGURATION_DELETE,
          ],
          children: [],
        },
        {
          name: this.$t('admin.vuln_sources'),
          id: 'vulnerabilitysources',
          permission: [
            SYSTEM_CONFIGURATION,
            SYSTEM_CONFIGURATION_CREATE,
            SYSTEM_CONFIGURATION_READ,
            SYSTEM_CONFIGURATION_UPDATE,
            SYSTEM_CONFIGURATION_DELETE,
          ],
          children: [],
        },
        {
          name: this.$t('admin.repositories'),
          id: 'repositories',
          permission: [
            SYSTEM_CONFIGURATION,
            SYSTEM_CONFIGURATION_CREATE,
            SYSTEM_CONFIGURATION_READ,
            SYSTEM_CONFIGURATION_UPDATE,
            SYSTEM_CONFIGURATION_DELETE,
          ],
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
          permission: [
            SYSTEM_CONFIGURATION,
            SYSTEM_CONFIGURATION_CREATE,
            SYSTEM_CONFIGURATION_READ,
            SYSTEM_CONFIGURATION_UPDATE,
            SYSTEM_CONFIGURATION_DELETE,
          ],
          children: [
            {
              component: 'Alerts',
              name: this.$t('admin.alerts'),
              route: 'notifications/alerts',
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
          permission: [
            SYSTEM_CONFIGURATION,
            SYSTEM_CONFIGURATION_CREATE,
            SYSTEM_CONFIGURATION_READ,
            SYSTEM_CONFIGURATION_UPDATE,
            SYSTEM_CONFIGURATION_DELETE,
          ],
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
              component: 'KennaSecurity',
              name: this.$t('admin.kenna_security'),
              route: 'integrations/kennaSecurity',
            },
          ],
        },
        {
          name: this.$t('admin.access_management'),
          id: 'accessmanagement',
          permission: [
            ACCESS_MANAGEMENT,
            ACCESS_MANAGEMENT_CREATE,
            ACCESS_MANAGEMENT_READ,
            ACCESS_MANAGEMENT_UPDATE,
            ACCESS_MANAGEMENT_DELETE,
          ],
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
        {
          name: this.$t('admin.workflows'),
          id: 'workflows',
          permission: [SYSTEM_CONFIGURATION, SYSTEM_CONFIGURATION_READ],
          children: [
            {
              component: 'WorkflowRunList',
              name: this.$t('admin.workflow_runs'),
              route: 'workflows/runs',
            },
            {
              component: 'TaskQueueList',
              name: this.$t('admin.task_queues'),
              route: 'workflows/taskQueues',
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
.admin-menu-item-readonly {
  font-style: italic;
  opacity: 0.85;
}
.admin-menu-item-readonly .fa-info-circle {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.6;
}
.admin-menu-subheader {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.03);
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
  cursor: default;
}
</style>
