<template>
  <div>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.configurationMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.configuration') }}</strong>
      </div>
      <b-collapse id="configurationMenu" visible accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in configurationMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.analyzersMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.analyzers') }}</strong>
      </div>
      <b-collapse id="analyzersMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in analyzersMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.repositoriesMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.repositories') }}</strong>
      </div>
      <b-collapse id="repositoriesMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in repositoriesMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.notificationsMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.notifications') }}</strong>
      </div>
      <b-collapse id="notificationsMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in notificationsMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.integrationsMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.integrations') }}</strong>
      </div>
      <b-collapse id="integrationsMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in integrationsMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.accessManagementMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.access_management') }}</strong>
      </div>
      <b-collapse id="accessManagementMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in accessManagementMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href" @click="emitEvent(item)">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

  </div>
</template>

<script>
  import EventBus from "../../shared/eventbus";

  export default {
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
        configurationMenu: [
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
        ],
        analyzersMenu: [
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
        ],
        repositoriesMenu: [
          {
            component: "Repositories",
            name: this.$t('admin.gem'),
            href: "#repositoryGemTab"
          },
          {
            component: "Repositories",
            name: this.$t('admin.hex'),
            href: "#repositoryHexTab"
          },
          {
            component: "Repositories",
            name: this.$t('admin.maven'),
            href: "#repositoryMavenTab"
          },
          {
            component: "Repositories",
            name: this.$t('admin.npm'),
            href: "#repositoryNpmTab"
          },
          {
            component: "Repositories",
            name: this.$t('admin.nuget'),
            href: "#repositoryNugetTab"
          },
          {
            component: "Repositories",
            name: this.$t('admin.python'),
            href: "#repositoryPythonTab"
          }
        ],
        notificationsMenu: [
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
        ],
        integrationsMenu: [
          {
            component: "FortifySsc",
            name: this.$t('admin.fortify_ssc'),
            href: "#integrationsFortifySscTab"
          },
          {
            component: "KennaSecurity",
            name: this.$t('admin.kenna_security'),
            href: "#integrationsKennaSecurityTab"
          },
          {
            component: "ThreadFix",
            name: this.$t('admin.threadfix'),
            href: "#integrationsThreadFixTab"
          }
        ],
        accessManagementMenu: [
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
