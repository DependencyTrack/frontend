<template>
  <div>

    <b-card no-body class="admin-menu" v-for="section in menu" v-bind:key="section.id">
      <div slot="header" v-if="isPermitted(section.permission)" v-b-toggle="section.id" style="cursor:pointer;">
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ section.name }}</strong>
      </div>
      <b-collapse v-if="isPermitted(section.permission)" :id="section.id" visible accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in section.children" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

  </div>
</template>

<script>
  import EventBus from "../../shared/eventbus";
  import {ACCESS_MANAGEMENT, SYSTEM_CONFIGURATION} from "../../shared/permissions";
  import permissionsMixin from "../../mixins/permissionsMixin";

  export default {
    mixins: [permissionsMixin],
    components: {
      EventBus
    },
    methods: {
      emitEvent: function(plugin) {
        EventBus.$emit('admin:plugin', plugin);
      }
    },
    data() {
      return {
        menu: [
          {
            name: this.$t('admin.configuration'),
            id: "configurationMenu",
            permission: SYSTEM_CONFIGURATION,
            children: [
              {
                component: 'General',
                name: this.$t('admin.general'),
                href: "#generalConfigTab"
              },
              {
                component: 'BomFormats',
                name: this.$t('admin.bom_formats'),
                href: "#bomFormatsTab"
              },
              {
                component: 'Email',
                name: this.$t('admin.email'),
                href: "#emailTab"
              },
              {
                component: 'InternalComponents',
                name: this.$t('admin.internal_components'),
                href: "#internalComponentsTab"
              }
            ]
          },
          {
            name: this.$t('admin.analyzers'),
            id: "analyzersMenu",
            permission: SYSTEM_CONFIGURATION,
            children: [
              {
                component: "InternalAnalyzer",
                name: this.$t('admin.internal_analyzer'),
                href: "#scannerInternalTab"
              },
              {
                component: "NpmAuditAnalyzer",
                name: this.$t('admin.npm_audit'),
                href: "#scannerNpmAuditTab"
              },
              {
                component: "OssIndexAnalyzer",
                name: this.$t('admin.oss_index'),
                href: "#scannerOssIndexTab"
              },
              {
                component: "VulnDbAnalyzer",
                name: this.$t('admin.vulndb'),
                href: "#scannerVulnDbTab"
              }
            ]
          },
          {
            name: this.$t('admin.repositories'),
            id: "repositoriesMenu",
            permission: SYSTEM_CONFIGURATION,
            children: [
              {
                component: "Gem",
                name: this.$t('admin.gem'),
                href: "#repositoryGemTab"
              },
              {
                component: "Hex",
                name: this.$t('admin.hex'),
                href: "#repositoryHexTab"
              },
              {
                component: "Maven",
                name: this.$t('admin.maven'),
                href: "#repositoryMavenTab"
              },
              {
                component: "Npm",
                name: this.$t('admin.npm'),
                href: "#repositoryNpmTab"
              },
              {
                component: "Nuget",
                name: this.$t('admin.nuget'),
                href: "#repositoryNugetTab"
              },
              {
                component: "Python",
                name: this.$t('admin.python'),
                href: "#repositoryPythonTab"
              }
            ]
          },
          {
            name: this.$t('admin.notifications'),
            id: "notificationsMenu",
            permission: SYSTEM_CONFIGURATION,
            children: [
              {
                component: "Alerts",
                name: this.$t('admin.alerts'),
                href: "#notificationAlertTab"
              },
              {
                component: "Templates",
                name: this.$t('admin.templates'),
                href: "#notificationTemplateTab"
              }
            ]
          },
          {
            name: this.$t('admin.integrations'),
            id: "integrationsMenu",
            permission: SYSTEM_CONFIGURATION,
            children: [
              {
                component: "FortifySsc",
                name: this.$t('admin.fortify_ssc'),
                href: "#integrationsFortifySscTab"
              },
              {
                component: "KennaSecurity",
                name: this.$t('admin.kenna_security'),
                href: "#integrationsKennaSecurityTab"
              }
            ]
          },
          {
            name: this.$t('admin.access_management'),
            id: "accessmanagementMenu",
            permission: ACCESS_MANAGEMENT,
            children: [
              {
                component: "LdapUsers",
                name: this.$t('admin.ldap_users'),
                href: "#ldapUsersTab"
              },
              {
                component: "ManagedUsers",
                name: this.$t('admin.managed_users'),
                href: "#managedUsersTab"
              },
              {
                component: "Teams",
                name: this.$t('admin.teams'),
                href: "#teamsTab"
              },
              {
                component: "Permissions",
                name: this.$t('admin.permissions'),
                href: "#permissionsTab"
              }
            ]
          }
        ]
      }
    }
  }
</script>

<style scoped>
  .admin-menu {
    margin-bottom: .3rem;
  }
  .list-group-item:first-child, .list-group-item:last-child {
    border-radius: 0;
  }
  .list-group-item {
    border-left: 0;
    border-right: 0;
  }
</style>
